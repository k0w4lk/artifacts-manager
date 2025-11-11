import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CameraDialog } from '../features/camera-dialog/camera-dialog';

@Component({
  selector: 'app-camera',
  imports: [],
  templateUrl: './camera.html',
  styleUrl: './camera.css',
})
export class Camera {
  readonly matDialog = inject(MatDialog);

  takePhoto(): void {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: 'environment',
        },
        audio: false,
      })
      .then((stream) => {
        this.matDialog.open(CameraDialog, {
          data: { stream },
          width: '100dvw',
          height: '100dvh',
          maxWidth: '100dvw',
          maxHeight: '100dvh',
          hasBackdrop: false,
        });
      })
      .catch((err) => {
        console.error(`An error occurred: ${err}`);
      });
  }

  // 655 1120
}
