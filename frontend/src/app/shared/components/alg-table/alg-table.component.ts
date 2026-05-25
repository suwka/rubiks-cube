import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Algorithm } from '../../../core/models/algorithm.model';
import { AuthService } from '../../../core/services/auth.service';
import { AlgorithmService } from '../../../core/services/algorithm.service';

@Component({
	selector: 'app-alg-table',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule],
	template: `
		<section class="alg-table-shell">
			<header class="table-header">
				<h2>algorytmy {{ category.toUpperCase() }}</h2>
			</header>

			<div class="feedback error" *ngIf="errorMessage">{{ errorMessage }}</div>
			<div class="feedback success" *ngIf="statusMessage">{{ statusMessage }}</div>

			<div class="loading" *ngIf="loading">ladowanie algorytmow...</div>

			<div class="table-wrap" *ngIf="!loading">
				<table>
					<thead>
						<tr>
							<th>podglad</th>
							<th>algorytm</th>
							<th *ngIf="isAdmin">akcje</th>
						</tr>
					</thead>
					<tbody>
						<ng-container *ngFor="let alg of algorithms">
							<tr>
								<td class="thumb-cell">
									<img *ngIf="alg.imageUrl; else placeholder" [src]="alg.imageUrl!" [alt]="alg.name" />
									<ng-template #placeholder>
										<div class="thumb-placeholder">?</div>
									</ng-template>
								</td>
								<td class="details-cell">
									<div class="name-row">
										<strong>{{ alg.name }}</strong>
									</div>
									<p class="moves">{{ alg.moves }}</p>
									<p class="description" *ngIf="alg.description">{{ alg.description }}</p>
								</td>
								<td class="actions-cell" *ngIf="isAdmin">
									<div class="actions">
										<button type="button" class="ghost" (click)="startEdit(alg)">edytuj</button>
										<button type="button" class="danger" (click)="deleteAlgorithm(alg)">usun</button>
									</div>
								</td>
							</tr>
							<tr class="edit-row" *ngIf="editingAlgorithm?.id === alg.id && isAdmin">
								<td colspan="3">
									<form class="edit-form" [formGroup]="editForm" (ngSubmit)="saveEdit()">
										<label>
											<span>nazwa</span>
											<input type="text" formControlName="name" />
										</label>
										<label>
											<span>ruchy</span>
											<input type="text" formControlName="moves" />
										</label>
										<label>
											<span>opis</span>
											<textarea rows="3" formControlName="description"></textarea>
										</label>
										<label>
											<span>obrazek</span>
											<input type="file" accept="image/png,image/jpeg,image/webp" (change)="onEditFileSelected($event)" />
										</label>
										<div class="form-actions">
											<button type="submit" class="primary" [disabled]="editForm.invalid || saving">zapisz</button>
											<button type="button" class="ghost" (click)="cancelEdit()">anuluj</button>
										</div>
									</form>
								</td>
							</tr>
						</ng-container>
					</tbody>
				</table>
			</div>

			<section class="add-panel" *ngIf="isAdmin">
				<h3>dodaj algorytm</h3>
				<form class="add-form" [formGroup]="addForm" (ngSubmit)="createAlgorithm()">
					<label>
						<span>nazwa</span>
						<input type="text" formControlName="name" />
					</label>
					<label>
						<span>ruchy</span>
						<input type="text" formControlName="moves" />
					</label>
					<label>
						<span>opis</span>
						<textarea rows="3" formControlName="description"></textarea>
					</label>
					<label>
						<span>obrazek</span>
						<input type="file" accept="image/png,image/jpeg,image/webp" (change)="onAddFileSelected($event)" />
					</label>
					<div class="form-actions">
						<button type="submit" class="primary" [disabled]="addForm.invalid || saving">dodaj</button>
					</div>
				</form>
			</section>
		</section>
	`,
	styles: [`
		:host {
			display: block;
			padding: 2rem 1rem 4rem;
		}

		.alg-table-shell {
			max-width: 1200px;
			margin: 0 auto;
			display: grid;
			gap: 1rem;
		}

		.table-header {
			padding-inline: .25rem;
		}

		h2 {
			margin: 0;
			font-size: clamp(1.6rem, 3vw, 2.4rem);
		}

		.feedback {
			padding: .85rem 1rem;
			border-radius: .9rem;
			font-weight: 600;
		}

		.feedback.error {
			background: rgba(239, 68, 68, .08);
			color: #b91c1c;
		}

		.feedback.success {
			background: rgba(34, 197, 94, .08);
			color: #166534;
		}

		.loading {
			padding: 1rem 0;
			color: #6b7280;
		}

		.table-wrap {
			margin-top: .25rem;
			overflow-x: auto;
			border: 1px solid rgba(17, 24, 39, .1);
			border-radius: 1.2rem;
			background: rgba(255, 255, 255, .9);
			box-shadow: 0 12px 30px rgba(15, 23, 42, .05);
		}

		table {
			width: 100%;
			border-collapse: collapse;
		}

		thead th {
			text-align: left;
			padding: .9rem 1rem;
			font-size: .78rem;
			text-transform: uppercase;
			letter-spacing: .14em;
			color: #6b7280;
			border-bottom: 1px solid rgba(17, 24, 39, .08);
		}

		tbody td {
			padding: 1rem;
			vertical-align: top;
			border-bottom: 1px solid rgba(17, 24, 39, .06);
		}

		.thumb-cell {
			width: 80px;
		}

		.thumb-cell img,
		.thumb-placeholder {
			width: 80px;
			height: 80px;
			border-radius: .95rem;
			object-fit: cover;
		}

		.thumb-placeholder {
			display: grid;
			place-items: center;
			background: #e5e7eb;
			color: #6b7280;
			font-size: 1.5rem;
			font-weight: 700;
		}

		.details-cell {
			width: auto;
		}

		.name-row strong {
			font-size: 1.02rem;
		}

		.moves {
			margin: .45rem 0 0;
			font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
			font-size: .95rem;
			color: #111827;
		}

		.description {
			margin: .45rem 0 0;
			color: #6b7280;
			line-height: 1.55;
		}

		.actions-cell {
			width: 190px;
		}

		.actions,
		.form-actions {
			display: flex;
			gap: .6rem;
			flex-wrap: wrap;
		}

		button {
			border: 0;
			border-radius: .85rem;
			padding: .7rem 1rem;
			font-weight: 700;
			cursor: pointer;
		}

		button.primary {
			background: #111827;
			color: #fff;
		}

		button.ghost {
			background: #e5e7eb;
			color: #111827;
		}

		button.danger {
			background: #fee2e2;
			color: #b91c1c;
		}

		button:disabled {
			opacity: .6;
			cursor: not-allowed;
		}

		.edit-row td {
			background: rgba(248, 250, 252, .95);
		}

		.edit-form,
		.add-form {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 1rem;
		}

		.add-form {
			margin-top: 1rem;
		}

		.add-panel {
			padding: 1.25rem;
			border: 1px solid rgba(17, 24, 39, .1);
			border-radius: 1.2rem;
			background: rgba(255, 255, 255, .9);
			box-shadow: 0 12px 30px rgba(15, 23, 42, .05);
		}

		.add-panel h3 {
			margin: 0;
			font-size: 1.15rem;
			text-transform: uppercase;
			letter-spacing: .16em;
		}

		label {
			display: grid;
			gap: .4rem;
		}

		label span {
			font-size: .78rem;
			text-transform: uppercase;
			letter-spacing: .12em;
			color: #6b7280;
		}

		input,
		textarea {
			width: 100%;
			border: 1px solid rgba(17, 24, 39, .15);
			border-radius: .8rem;
			padding: .8rem .9rem;
			font: inherit;
			background: #fff;
			color: #111827;
		}

		textarea {
			grid-column: 1 / -1;
			resize: vertical;
		}

		@media (max-width: 900px) {
			.table-header {
				flex-direction: column;
				align-items: start;
			}

			.hint {
				text-align: left;
			}

			.edit-form,
			.add-form {
				grid-template-columns: 1fr;
			}
		}
	`]
})
export class AlgTableComponent implements OnInit {
	@Input({ required: true }) category!: 'pll' | 'oll' | 'f2l';

	protected algorithms: Algorithm[] = [];
	protected loading = true;
	protected errorMessage = '';
	protected statusMessage = '';
	protected isAdmin = false;
	protected editingAlgorithm: Algorithm | null = null;
	protected saving = false;
	private readonly fb = inject(FormBuilder);

	protected readonly editForm = this.fb.group({
		name: ['', [Validators.required, Validators.minLength(1)]],
		moves: ['', [Validators.required, Validators.minLength(1)]],
		description: ['']
	});

	protected readonly addForm = this.fb.group({
		name: ['', [Validators.required, Validators.minLength(1)]],
		moves: ['', [Validators.required, Validators.minLength(1)]],
		description: ['']
	});

	private readonly algorithmService = inject(AlgorithmService);
	private readonly authService = inject(AuthService);
	private readonly changeDetectorRef = inject(ChangeDetectorRef);
	private readonly destroyRef = inject(DestroyRef);
	private selectedEditFile: File | null = null;
	private selectedAddFile: File | null = null;

	ngOnInit(): void {
		this.authService.currentUser$
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe((user) => {
				this.isAdmin = user?.role === 'admin';
				this.changeDetectorRef.detectChanges();
			});

		this.loadAlgorithms();
	}

	protected loadAlgorithms(): void {
		this.loading = true;
		this.errorMessage = '';

		this.algorithmService
			.getAlgorithms(this.category)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (algorithms) => {
					this.algorithms = algorithms;
					this.loading = false;
					this.changeDetectorRef.detectChanges();
				},
				error: (error) => {
					this.errorMessage = error instanceof Error ? error.message : 'nie mozna pobrac algorytmow.';
					this.loading = false;
					this.changeDetectorRef.detectChanges();
				}
			});
	}

	protected startEdit(alg: Algorithm): void {
		this.editingAlgorithm = alg;
		this.selectedEditFile = null;
		this.statusMessage = '';
		this.errorMessage = '';
		this.editForm.reset({
			name: alg.name,
			moves: alg.moves,
			description: alg.description ?? ''
		});
	}

	protected cancelEdit(): void {
		this.editingAlgorithm = null;
		this.selectedEditFile = null;
		this.editForm.reset({ name: '', moves: '', description: '' });
	}

	protected onEditFileSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		this.selectedEditFile = input.files?.[0] ?? null;
	}

	protected saveEdit(): void {
		if (!this.editingAlgorithm || this.editForm.invalid) {
			return;
		}

		const formData = new FormData();
		formData.append('name', this.editForm.value.name ?? '');
		formData.append('moves', this.editForm.value.moves ?? '');
		formData.append('description', this.editForm.value.description ?? '');
		if (this.selectedEditFile) {
			formData.append('image_file', this.selectedEditFile);
		}

		this.saving = true;
		this.errorMessage = '';
		this.statusMessage = '';

		this.algorithmService
			.updateAlgorithm(this.editingAlgorithm.id, formData)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: () => {
					this.statusMessage = 'algorytm zostal zaktualizowany.';
					this.saving = false;
					this.cancelEdit();
					this.loadAlgorithms();
					this.changeDetectorRef.detectChanges();
				},
				error: (error) => {
					this.errorMessage = error instanceof Error ? error.message : 'nie mozna zaktualizowac algorytmu.';
					this.saving = false;
					this.changeDetectorRef.detectChanges();
				}
			});
	}

	protected onAddFileSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		this.selectedAddFile = input.files?.[0] ?? null;
	}

	protected createAlgorithm(): void {
		if (this.addForm.invalid) {
			return;
		}

		const formData = new FormData();
		formData.append('category', this.category);
		formData.append('name', this.addForm.value.name ?? '');
		formData.append('moves', this.addForm.value.moves ?? '');
		formData.append('description', this.addForm.value.description ?? '');
		if (this.selectedAddFile) {
			formData.append('image_file', this.selectedAddFile);
		}

		this.saving = true;
		this.errorMessage = '';
		this.statusMessage = '';

		this.algorithmService
			.createAlgorithm(formData)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: () => {
					this.statusMessage = 'algorytm zostal dodany.';
					this.saving = false;
					this.addForm.reset({ name: '', moves: '', description: '' });
					this.selectedAddFile = null;
					this.loadAlgorithms();
					this.changeDetectorRef.detectChanges();
				},
				error: (error) => {
					this.errorMessage = error instanceof Error ? error.message : 'nie mozna dodac algorytmu.';
					this.saving = false;
					this.changeDetectorRef.detectChanges();
				}
			});
	}

	protected deleteAlgorithm(alg: Algorithm): void {
		const confirmed = confirm(`Usunac algorytm ${alg.name}?`);
		if (!confirmed) {
			return;
		}

		this.algorithmService
			.deleteAlgorithm(alg.id)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: () => {
					this.statusMessage = 'algorytm zostal usuniety.';
					this.loadAlgorithms();
					this.changeDetectorRef.detectChanges();
				},
				error: (error) => {
					this.errorMessage = error instanceof Error ? error.message : 'nie mozna usunac algorytmu.';
					this.changeDetectorRef.detectChanges();
				}
			});
	}
}