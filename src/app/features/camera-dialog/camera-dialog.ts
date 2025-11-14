import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  Renderer2,
  signal,
  viewChild,
} from '@angular/core';
import { ParseTextService } from '../../parse-text-service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-camera-dialog',
  imports: [JsonPipe],
  templateUrl: './camera-dialog.html',
  styleUrl: './camera-dialog.css',
})
export class CameraDialog implements AfterViewInit {
  readonly matDialogData = inject<{ stream: MediaStream }>(MAT_DIALOG_DATA);
  readonly matDialogRef = inject(MatDialogRef);
  readonly parseTextService = inject(ParseTextService);
  readonly renderer = inject(Renderer2);
  readonly canvasElRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  readonly videoElRef = viewChild<ElementRef<HTMLVideoElement>>('video');

  width = Math.min(window.innerWidth, window.innerHeight) * 0.95; // We will scale the photo width to this
  height = 0; // This will be computed based on the input stream

  videoClientHeight = 0;
  videoClientWidth = 0;

  tempCanvas: HTMLCanvasElement | null = null;

  streaming = false;

  res = signal<any>({});

  readonly photoTaken = signal<boolean>(false);

  ngAfterViewInit(): void {
    const video = this.videoElRef()!.nativeElement;
    video.srcObject = this.matDialogData.stream;
    video.play();
  }

  captureFrames(): void {
    if (!this.streaming) {
      const canvas = this.canvasElRef()!.nativeElement;
      const video = this.videoElRef()!.nativeElement;

      this.width = video.videoWidth;
      this.height = video.videoHeight;

      this.res.set({
        w: this.width,
        h: this.height,
      });

      const sh = this.height * 0.95;
      const sw = (sh * 4) / 7;

      video.setAttribute('width', this.width.toString());
      video.setAttribute('height', this.height.toString());
      canvas.setAttribute('width', sw.toString());
      canvas.setAttribute('height', sh.toString());

      this.videoClientHeight = video.clientHeight * 0.95;
      this.videoClientWidth = Math.min(
        video.clientWidth * 0.95,
        ((this.videoClientHeight * 0.95) / 7) * 4,
      );

      this.streaming = true;
    }
  }

  stop(): void {
    const video = this.videoElRef()!.nativeElement;
    this.streaming = false;
    this.matDialogData.stream.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
  }

  takePicture(event: MouseEvent) {
    this.tempCanvas = this.canvasElRef()!.nativeElement;
    const video = this.videoElRef()!.nativeElement;
    const context = this.tempCanvas.getContext('2d')!;
    if (this.width && this.height) {
      const sh = this.height * 0.95;
      const sw = (sh * 4) / 7;
      const sx = (this.width - sw) / 2;
      const sy = this.height * 0.025;

      context.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);

      this.stop();
      this.photoTaken.set(true);
    } else {
      this.clearPhoto();
    }
    event.preventDefault();
  }

  acceptScreenshot(): void {
    if (!this.tempCanvas) return;

    const data = this.tempCanvas.toDataURL('image/png');
    this.parseTextService.parseImage(this.dataURLtoFile(data, 'art.png'));
    this.matDialogRef.close();
  }

  clearPhoto() {
    const canvas = this.canvasElRef()!.nativeElement;

    const context = canvas.getContext('2d')!;
    context.fillStyle = '#aaaaaa';
    context.fillRect(0, 0, canvas.width, canvas.height);
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
