import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
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
  readonly canvasElRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  readonly videoElRef = viewChild<ElementRef<HTMLVideoElement>>('video');

  width = Math.min(window.innerWidth, window.innerHeight) * 0.95; // We will scale the photo width to this
  height = 0; // This will be computed based on the input stream

  initialVideoHeight = 0;
  initialVideoWidth = 0;

  streaming = false;

  cfg = signal<any>({});

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

      this.initialVideoHeight = video.videoHeight;
      this.initialVideoWidth = video.videoWidth;

      console.log(this.initialVideoWidth, this.initialVideoHeight);

      this.width = video.videoWidth;
      this.height = video.videoHeight;
      console.log(video.videoHeight, video.videoWidth, this.width);

      const sh = this.height * 0.95;
      const sw = (sh * 4) / 7;

      video.setAttribute('width', this.width.toString());
      video.setAttribute('height', this.height.toString());
      canvas.setAttribute('width', sw.toString());
      canvas.setAttribute('height', sh.toString());
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
    const canvas = this.canvasElRef()!.nativeElement;
    const video = this.videoElRef()!.nativeElement;
    const context = canvas.getContext('2d')!;
    if (this.width && this.height) {
      // canvas.width = this.width;
      // canvas.height = this.height;

      const sh = this.height * 0.95;
      const sw = (sh * 4) / 7;
      const sx = (this.width - sw) / 2;
      const sy = this.height * 0.025;
      this.cfg.set({
        videoWidth: this.width,
        videoHeight: this.height,
        initVideoWidth: this.initialVideoWidth,
        initVideoHeight: this.initialVideoHeight,
        sh,
        sw,
        sx,
        sy,
      });
      console.log(this.width, this.height, sh, sw, sx, sy);

      context.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);

      // canvas.width = sw;
      // canvas.height = sh;

      const data = canvas.toDataURL('image/png');
      // this.parseTextService.OCRSpace(data);
      this.parseTextService.tesseract(this.dataURLtoFile(data, 'art.png'));
      this.photoTaken.set(true);
      this.stop();
      // this.matDialogRef.close();
    } else {
      this.clearPhoto();
    }
    event.preventDefault();
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
