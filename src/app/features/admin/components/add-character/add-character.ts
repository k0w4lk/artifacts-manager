import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { addDoc, collection, collectionData, Firestore, getDocs } from '@angular/fire/firestore';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogTitle,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { combineLatest, from } from 'rxjs';
import { ArtifactSet } from '../../../../core/utils/set-interface';
import { DataService } from '../../../../core/services/data-service';

@Component({
  selector: 'app-add-character',
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDialogClose,
  ],
  templateUrl: './add-character.html',
  styleUrl: './add-character.css',
})
export class AddCharacter implements OnInit {
  readonly dataService = inject(DataService);

  readonly #destroyRef = inject(DestroyRef);
  readonly #firestore = inject(Firestore);
  readonly #matDialogRef = inject<MatDialogRef<AddCharacter>>(MatDialogRef);

  readonly sets = signal<ArtifactSet[]>([]);

  itemCollection = collection(this.#firestore, 'characters');
  item$ = collectionData<any>(this.itemCollection);

  readonly #setsCollection = collection(this.#firestore, 'sets');

  readonly form = new FormGroup({
    nameEn: new FormControl<string>(''),
    mainSets: new FormControl<string[]>([]),
    altSets: new FormControl<string[]>([]),
    subSets: new FormControl<string[]>([]),
    perfectStats: new FormControl<string[]>([]),
    goodStats: new FormControl<string[]>([]),
    okStats: new FormControl<string[]>([]),
    sandsStats: new FormControl<string[]>([]),
    gobletStats: new FormControl<string[]>([]),
    crownStats: new FormControl<string[]>([]),
  });

  ngOnInit(): void {
    this.#requestSets();
  }

  add(): void {
    addDoc(this.itemCollection, this.form.value).then(() => this.#matDialogRef.close());
  }

  #requestSets(): void {
    from(getDocs(this.#setsCollection))
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((snapshot) => {
        const sets = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

        this.sets.set(sets as ArtifactSet[]);
      });
  }
}
