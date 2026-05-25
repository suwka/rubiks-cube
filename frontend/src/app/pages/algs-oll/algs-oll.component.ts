import { Component } from '@angular/core';

import { AlgTableComponent } from '../../shared/components/alg-table/alg-table.component';

@Component({
	selector: 'app-algs-oll-page',
	standalone: true,
	imports: [AlgTableComponent],
	template: `<app-alg-table category="oll" />`
})
export class AlgsOllComponent {}