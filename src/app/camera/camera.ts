import { JsonPipe } from '@angular/common';
import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-camera',
  imports: [RouterOutlet, JsonPipe],
  templateUrl: './camera.html',
  styleUrl: './camera.css',
})
export class Camera {
  readonly canvasElRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  readonly videoElRef = viewChild<ElementRef<HTMLVideoElement>>('video');
  readonly imgElRef = viewChild<ElementRef<HTMLImageElement>>('photo');

  width = 320; // We will scale the photo width to this
  height = 0; // This will be computed based on the input stream

  res = signal<any>(null);

  streaming = false;

  takePhoto(): void {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: 'environment',
        },
        audio: false,
      })
      .then((stream) => {
        const video = this.videoElRef()!.nativeElement;
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error(`An error occurred: ${err}`);
      });
  }

  captureFrames(): void {
    if (!this.streaming) {
      const canvas = this.canvasElRef()!.nativeElement;
      const video = this.videoElRef()!.nativeElement;

      this.height = video.videoHeight / (video.videoWidth / this.width);

      video.setAttribute('width', this.width.toString());
      video.setAttribute('height', this.height.toString());
      canvas.setAttribute('width', this.width.toString());
      canvas.setAttribute('height', this.height.toString());
      this.streaming = true;
    }
  }

  clearPhoto() {
    const canvas = this.canvasElRef()!.nativeElement;
    const photo = this.imgElRef()!.nativeElement;

    const context = canvas.getContext('2d')!;
    context.fillStyle = '#aaaaaa';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const data = canvas.toDataURL('image/png');
    photo.setAttribute('src', data);
  }

  takePicture(event: MouseEvent) {
    const canvas = this.canvasElRef()!.nativeElement;
    const video = this.videoElRef()!.nativeElement;
    const photo = this.imgElRef()!.nativeElement;
    const context = canvas.getContext('2d')!;
    if (this.width && this.height) {
      canvas.width = this.width;
      canvas.height = this.height;
      context.drawImage(video, 0, 0, this.width, this.height);

      const data = canvas.toDataURL('image/png');
      // const file = this.dataURLtoFile(data, 'kek.png');
      this.main(data);

      photo.setAttribute('src', data);
    } else {
      this.clearPhoto();
    }
    event.preventDefault();
  }

  main(base64Image: string) {
    const config = {
      language: 'rus',
      isOverlayRequired: false,
      iscreatesearchablepdf: false,
      issearchablepdfhidetextlayer: false,
      OCREngine: 2,
      base64Image,
      filetype: 'png',
    };

    const data = new FormData();

    Object.entries(config).forEach(([k, v]) => {
      data.append(k, v as any);
    });

    fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        apikey: 'K89906720888957',
      },
      body: data,
    })
      .then((res) => res.json())
      .then((res) => {
        this.res.set(res);
        console.log(res);
      });
  }

  dataURLtoFile(dataurl: string, filename: string) {
    const arr = dataurl.split(',')!;
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    const blob = new Blob([u8arr], { type: mime });
    return new File([blob], filename, { type: mime });
  }
}
