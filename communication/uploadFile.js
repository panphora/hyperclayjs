import toast from "../ui/toast.js";
import debounce from "../utilities/debounce.js";
import copyToClipboard from "../string-utilities/copy-to-clipboard.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function uploadFile(eventOrFile, callback = () => {}, extraData = {}) {
  // handle event
  if (eventOrFile instanceof Event) {
    eventOrFile.preventDefault();
    const fileInput = eventOrFile.target;
    const file = fileInput.files[0];
    return uploadFileFromObject(file, res => {
      callback(res);
      fileInput.value = ""; // Reset fileInput after upload
    }, extraData);
  }

  // handle raw file object
  if (eventOrFile instanceof File) {
    return uploadFileFromObject(eventOrFile, callback, extraData);
  }

  return Promise.reject(new Error('uploadFile requires either an Event or File object'));
}

export function createFile(eventOrData) {
  // handle file as event
  if (eventOrData instanceof Event) {
    eventOrData.preventDefault();
    const formElem = eventOrData.target;
    const fileNameInput = formElem.querySelector('[name="file_name"]');
    const fileBodyInput = formElem.querySelector('[name="file_body"]');
    
    const fileName = fileNameInput.value.trim();
    const fileBody = fileBodyInput.value;

    if (!isValidFileName(fileName)) {
      toast('Invalid filename', 'error');
      return Promise.reject(new Error('Invalid filename'));
    }

    return createFileFromData(fileName, fileBody, () => {
      resetFormElements(formElem);
    });
  }

  // handle file as base64 data
  if (eventOrData && typeof eventOrData === 'object' && 'fileName' in eventOrData && 'fileBody' in eventOrData) {
    return createFileFromData(eventOrData.fileName, eventOrData.fileBody);
  }

  // handle file as base64 data
  if (arguments.length === 2) {
    const [fileName, fileBody] = arguments;
    return createFileFromData(fileName, fileBody);
  }

  return Promise.reject(new Error('createFile requires either an Event, {fileName, fileBody} object, or (fileName, fileBody) parameters'));
}

export function uploadFileBasic (eventOrFile, {
  onProgress = (percent) => {},
  onComplete = (url) => {},
  onError = (error) => {}
} = {}) {
  function handleUpload(file) {
    if (file.size > MAX_FILE_SIZE) {
      onError(new Error('File too large'));
      return Promise.reject(new Error('File too large'));
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async function () {
        try {
          const fileBody = reader.result.split(",")[1];
          const fileName = file.name;
          const result = await uploadFileData(fileName, fileBody, (percentComplete, res) => {
            if (percentComplete === -1) {
              onError(new Error('Upload cancelled'));
            } else if (percentComplete < 100) {
              onProgress(percentComplete);
            } else if (res) {
              onComplete(res);
            }
          });
          resolve(result);
        } catch (error) {
          onError(error);
          reject(error);
        }
      };

      reader.onerror = () => {
        const error = new Error('Failed to read file');
        onError(error);
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  }

  if (eventOrFile instanceof Event) {
    eventOrFile.preventDefault();
    const file = eventOrFile.target.files[0];
    return handleUpload(file);
  }

  if (eventOrFile instanceof File) {
    return handleUpload(eventOrFile);
  }

  const error = new Error('uploadFile requires either an Event or File object');
  onError(error);
  return Promise.reject(error);
}

function uploadFileFromObject(file, onComplete = () => {}, extraData = {}) {
  if (file.size > MAX_FILE_SIZE) {
    toast(`Maximum file size: ${MAX_FILE_SIZE / 1024 / 1024}MB`, 'error');
    return Promise.reject(new Error('File too large'));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async function () {
      try {
        const fileBody = reader.result.split(",")[1];
        const fileName = file.name;
        const result = await uploadFileData(fileName, fileBody, function progressCallback(percentComplete, res) {
          if (percentComplete === -1) {
            toast('Upload cancelled', 'error');
          } else if (percentComplete < 100) {
            toast(`${percentComplete}% uploaded`);
          } else if (res) {
            const urls = res.urls ? res.urls.join("\n") : "";
            if (urls) {
              copyToClipboard(urls);
              toast(res.msg, res.msgType);
              onComplete(res);
            } else {
              toast(res.msg, res.msgType);
              onComplete(res);
            }
          }
        }, extraData);
        resolve(result);
      } catch (error) {
        const {msg, msgType} = error?.response ? JSON.parse(error.response) : {msg: 'Upload failed', msgType: 'error'};
        toast(msg, msgType);
        reject(error);
      }
    };

    reader.onerror = () => {
      toast('Failed to read file', 'error');
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

function createFileFromData(fileName, fileBody, onComplete = () => {}) {
  if (!isValidFileName(fileName)) {
    return Promise.reject(new Error('Invalid filename'));
  }

  const { adjustedFileName, base64FileBody } = processFileContents(fileName, fileBody);
  return uploadFileData(adjustedFileName, base64FileBody, function progressCallback(percentComplete, res) {
    if (percentComplete === -1) {
      toast('Upload cancelled', 'error');
    } else if (percentComplete < 100) {
      toast(`${percentComplete}% uploaded`);
    } else {
      const urls = res.urls.join("\n")
      copyToClipboard(urls);
      toast(res.msg, res.msgType);
      onComplete(res);
    }
  });
}

function uploadFileData(fileName, fileBody, progressCallback, extraData = {}) {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/upload", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  let lastReportedProgress = 0;
  const debouncedProgressCallback = debounce(function (event) {
    if (event.lengthComputable) {
      const percentComplete = Math.floor((event.loaded / event.total) * 100);
      if (
        (percentComplete >= 10 && percentComplete < 50 && lastReportedProgress < 10) ||
        (percentComplete >= 50 && percentComplete < 80 && lastReportedProgress < 50) ||
        (percentComplete >= 80 && percentComplete < 100 && lastReportedProgress < 80)
      ) {
        progressCallback(percentComplete);
        lastReportedProgress = percentComplete;
      }
    }
  }, 200);

  xhr.upload.onprogress = debouncedProgressCallback;

  const upload = new Promise((resolve, reject) => {
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          progressCallback(100, response);
          resolve(response);
        } else {
          let errorMessage = 'Upload failed';
          let errorResponse = {};
          let msgType = 'error';
          
          try {
            errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.msg || errorMessage;
            msgType = errorResponse.msgType || 'error';
          } catch (e) {
            // If response isn't valid JSON, use default message
          }
          
          // Show toast with the error message
          toast(errorMessage, msgType);
          
          const error = new Error(errorMessage);
          error.status = xhr.status;
          error.response = xhr.responseText;
          reject(error);
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error occurred'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Upload timed out'));
    };

    const data = JSON.stringify({
      fileName,
      fileBody,
      ...extraData
    });

    xhr.send(data);
  });

  upload.abort = () => {
    xhr.abort();
    progressCallback(-1, { msg: 'Upload cancelled' });
  };

  return upload;
}

function processFileContents(fileName, fileBody) {
  const contentTypeInfo = detectContentType(fileBody);
  
  const adjustedFileName = adjustFileExtension(fileName, contentTypeInfo.extension);
  const base64FileBody = base64EncodeUnicode(fileBody);

  return { adjustedFileName, base64FileBody };
}

function isValidFileName(name) {
  if (!name || typeof name !== 'string') return false;
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
  return name.length > 0 && name.length <= 255 && !invalidChars.test(name);
}

function adjustFileExtension(fileName, extension) {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex !== -1) {
    fileName = fileName.substring(0, dotIndex) + extension;
  } else {
    fileName += extension;
  }
  return fileName;
}

function base64EncodeUnicode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function resetFormElements(formElem) {
  const inputs = formElem.querySelectorAll('input[name], textarea[name]');
  inputs.forEach((input) => {
    if (input.hasAttribute("data-default-value")) {
      input.value = input.getAttribute("data-default-value");
    } else {
      input.value = "";
    }
  });
}

function detectContentType(content) {
  const patterns = [
    // HTML and SVG patterns
    { type: "html", mime: "text/html", regex: /<html/i },
    { type: "svg", mime: "image/svg+xml", regex: /<svg/i },
    // CSS pattern moved before JSON
    {
      type: "css",
      mime: "text/css",
      regex: /^\s*(\/\*[\s\S]*?\*\/\s*)?(@[a-z\-]+\s+)?([.#]?[a-zA-Z][\w-]*\s*,?\s*)+\s*\{/im,
    },
    // JavaScript pattern
    {
      type: "js",
      mime: "application/javascript",
      regex: /^\s*(\/\*[\s\S]*?\*\/\s*)?(\/\/.*\s*)*(import|export|var|let|const|function|class)\s+/im,
    },
    // CSV pattern
    { type: "csv", mime: "text/csv", regex: /^[^,\n]+(,[^,\n]+)+/ },
    // Markdown pattern
    {
      type: "md",
      mime: "text/markdown",
      regex: /#\S+\s+\S+|```[\s\S]*```/
    },
  ];

  for (const { type, mime, regex } of patterns) {
    if (regex.test(content)) {
      return { type, mime, extension: `.${type}` };
    }
  }

  // Try to parse as JSON
  try {
    JSON.parse(content);
    return { type: "json", mime: "application/json", extension: ".json" };
  } catch (e) {
    // Not JSON
  }

  // Default to plain text
  return { type: "txt", mime: "text/plain", extension: ".txt" };
}

// Export to window (called by export-to-window module)
export function exportToWindow() {
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.uploadFile = uploadFile;
  window.hyperclay.createFile = createFile;
  window.hyperclay.uploadFileBasic = uploadFileBasic;
}