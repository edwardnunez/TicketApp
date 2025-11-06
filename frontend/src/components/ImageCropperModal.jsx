import React, { useCallback, useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';
import { Modal, Slider } from 'antd';

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop, targetWidth = 1440, targetHeight = 900, mimeType = 'image/jpeg', background = '#111', quality = 0.9) {
  const image = await createImage(imageSrc);

  // 1) Crop exact area
  const cropCanvas = document.createElement('canvas');
  const ctx = cropCanvas.getContext('2d');
  cropCanvas.width = pixelCrop.width;
  cropCanvas.height = pixelCrop.height;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // 2) Resize to target canvas (16:9) without borders (already cropped to aspect)
  const outCanvas = document.createElement('canvas');
  const outCtx = outCanvas.getContext('2d');
  outCanvas.width = targetWidth;
  outCanvas.height = targetHeight;
  outCtx.fillStyle = background;
  outCtx.fillRect(0, 0, targetWidth, targetHeight);

  // scale to fit EXACTLY target keeping aspect the same as crop area
  const scale = Math.min(targetWidth / cropCanvas.width, targetHeight / cropCanvas.height);
  const drawW = Math.round(cropCanvas.width * scale);
  const drawH = Math.round(cropCanvas.height * scale);
  const dx = Math.floor((targetWidth - drawW) / 2);
  const dy = Math.floor((targetHeight - drawH) / 2);
  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = 'high';
  outCtx.drawImage(cropCanvas, dx, dy, drawW, drawH);

  return new Promise((resolve) => {
    outCanvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

const ImageCropperModal = ({
  open,
  src,
  onCancel,
  onComplete,
  aspect = 16 / 9
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    if (!open) {
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setCroppedAreaPixels(null);
    }
  }, [open]);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleOk = useCallback(async () => {
    if (!croppedAreaPixels || !src) return;
    const blob = await getCroppedImg(src, croppedAreaPixels, 1280, 720, 'image/jpeg', '#111', 0.85);
    onComplete && onComplete(blob);
  }, [croppedAreaPixels, src, onComplete]);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      title="Ajustar recorte de imagen"
      okText="Usar esta imagen"
      cancelText="Cancelar"
      width={720}
    >
      <div style={{ position: 'relative', width: '100%', height: 360, background: '#000', borderRadius: 8, overflow: 'hidden' }}>
        {src && (
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            restrictPosition={false}
          />
        )}
      </div>
      <div style={{ marginTop: 12 }}>
        <div>Zoom</div>
        <Slider min={1} max={3} step={0.01} value={zoom} onChange={setZoom} />
      </div>
    </Modal>
  );
};

export default ImageCropperModal;
