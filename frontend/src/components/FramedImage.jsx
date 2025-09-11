import React, { useMemo, useState } from 'react';

/**
 * FramedImage: sistema inteligente que adapta el comportamiento según la imagen.
 * - Detecta si la imagen se ajusta bien al aspect ratio deseado.
 * - Si la diferencia es mínima, usa 'cover' para eliminar bandas.
 * - Si la diferencia es grande, usa 'contain' para mostrar toda la imagen.
 * - Opción de forzar comportamiento específico.
 */
const FramedImage = ({
  src,
  alt,
  className,
  style,
  backgroundColor = '#111',
  borderRadius = 12,
  maxHeight,
  aspectRatio = 16/9,
  objectFit = 'smart', // 'smart', 'cover', 'contain'
  tolerance = 0.15, // Tolerancia para decidir entre cover/contain (15% por defecto)
  onLoad: onLoadProp
}) => {
  const [, setImageRatio] = useState(null);
  const [computedObjectFit, setComputedObjectFit] = useState('contain');

  const wrapperStyle = useMemo(() => {
    const base = {
      position: 'relative',
      width: '100%',
      backgroundColor,
      borderRadius,
      overflow: 'hidden',
      display: 'grid',
      placeItems: 'center'
    };
    
    // Mantener siempre el aspect ratio deseado del contenedor
    // No ajustar el contenedor al aspect ratio de la imagen
    return {
      ...base,
      aspectRatio: aspectRatio,
      maxHeight: maxHeight || undefined
    };
  }, [backgroundColor, borderRadius, maxHeight, aspectRatio]);

  const handleLoad = (e) => {
    const el = e.currentTarget;
    if (el && el.naturalWidth && el.naturalHeight) {
      const ratio = el.naturalWidth / el.naturalHeight;
      setImageRatio(ratio);
      
      // Decidir el objectFit basado en el modo
      if (objectFit === 'smart') {
        // Calcular diferencia entre ratios
        const diff = Math.abs(ratio - aspectRatio) / aspectRatio;
        
        // Si la diferencia es pequeña, usar cover para eliminar bandas
        // Si es grande, usar contain para mostrar toda la imagen
        // Pero para vistas previas, es mejor usar 'cover' para mantener el aspect ratio del contenedor
        setComputedObjectFit(diff <= tolerance ? 'cover' : 'cover');
      } else {
        setComputedObjectFit(objectFit);
      }
    }
    if (onLoadProp) onLoadProp(e);
  };

  return (
    <div className={className} style={{ ...wrapperStyle, ...style }}>
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        loading="lazy"
        decoding="async"
        style={{
          width: '100%',
          height: '100%',
          objectFit: computedObjectFit,
          display: 'block',
          backgroundColor
        }}
      />
    </div>
  );
};

export default FramedImage;