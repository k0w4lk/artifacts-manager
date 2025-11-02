import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'artifacts-manager',
        appId: '1:244952689549:web:be31179c7abc1be20eabc4',
        storageBucket: 'artifacts-manager.firebasestorage.app',
        apiKey: 'AIzaSyB3SqqNJkkpp0Hg7e4GaWlDygFdgFgUuJc',
        authDomain: 'artifacts-manager.firebaseapp.com',
        messagingSenderId: '244952689549',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
};
