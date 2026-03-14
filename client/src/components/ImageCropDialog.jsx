import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const getCroppedImg = (imageSrc, pixelCrop, maxWidth = 400, maxHeight = 400) => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = imageSrc;
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = pixelCrop.width;
            canvas.height = pixelCrop.height;

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

            // Resize if needed
            let finalWidth = canvas.width;
            let finalHeight = canvas.height;

            if (finalWidth > maxWidth) {
                finalHeight *= maxWidth / finalWidth;
                finalWidth = maxWidth;
            }
            if (finalHeight > maxHeight) {
                finalWidth *= maxHeight / finalHeight;
                finalHeight = maxHeight;
            }

            const resizeCanvas = document.createElement('canvas');
            resizeCanvas.width = finalWidth;
            resizeCanvas.height = finalHeight;
            const resizeCtx = resizeCanvas.getContext('2d');
            resizeCtx.drawImage(canvas, 0, 0, finalWidth, finalHeight);

            resizeCanvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.85);
        };
        image.onerror = reject;
    });
};

const ImageCropDialog = ({ isOpen, onClose, imageSrc, onCropComplete }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!croppedAreaPixels || !imageSrc) return;
        setIsProcessing(true);
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            onCropComplete(croppedBlob);
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Crop Avatar</DialogTitle>
                </DialogHeader>
                <div className="relative w-full h-[300px] bg-muted/30 rounded-xl overflow-hidden">
                    {imageSrc && (
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            cropShape="round"
                            showGrid={false}
                            onCropChange={setCrop}
                            onCropComplete={onCropCompleteHandler}
                            onZoomChange={setZoom}
                        />
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : 'Save Avatar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ImageCropDialog;
