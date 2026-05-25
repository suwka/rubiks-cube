import { Component } from '@angular/core';

import { AlgTableComponent } from '../../shared/components/alg-table/alg-table.component';

@Component({
	selector: 'app-algs-f2l-page',
	standalone: true,
	imports: [AlgTableComponent],
	template: `<app-alg-table category="f2l" />`
})
export class AlgsF2lComponent {}