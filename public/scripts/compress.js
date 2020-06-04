function comp(base64) {
  //compression returns a blob
  const canvas = document.createElement("canvas");
  const img = document.createElement("img");
  const compressionRate = 0.7;

  return new Promise((resolve, reject) => {
    img.onload = function() {
      let width = img.width;
      let height = img.height;
      const maxHeight = 2000;
      const maxWidth = 2000;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height *= maxWidth / width));
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width *= maxHeight / height));
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        function(blob) {
          resolve(blob);
        },
        "image/jpeg",
        compressionRate
      );
    };
    img.onerror = function(err) {
      reject(err);
    };
    img.src = base64;
  });
}
