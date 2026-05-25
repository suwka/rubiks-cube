import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'app-algs-page',
	standalone: true,
	imports: [RouterLink],
	template: `
		<section class="algs-page">
			<header class="hero">
				<p class="eyebrow">cfop</p>
				<h1>metoda cross, f2l, oll, pll</h1>
				<p class="lead">
					to jest szybki przeglad podstawowych etapow cfop. wybierz sekcje,
					ktora chcesz przejrzec bardziej szczegolowo.
				</p>
			</header>

			<div class="stages">
				<article class="stage-card">
					<h2>cross</h2>
					<p>budowa krzyza na dolnej scianie to pierwszy krok do stabilnych czasow.</p>
				</article>
				<article class="stage-card">
					<h2>f2l</h2>
					<p>laczenie naroznika z krawedzia i ukladanie pierwszych dwoch warstw.</p>
					<a routerLink="/algs/f2l">zobacz f2l</a>
				</article>
				<article class="stage-card">
					<h2>oll</h2>
					<p>orientacja ostatniej warstwy przed finalnym permutowaniem kawalkow.</p>
					<a routerLink="/algs/oll">zobacz oll</a>
				</article>
				<article class="stage-card">
					<h2>pll</h2>
					<p>permutacja ostatniej warstwy i domkniecie calego ukladania.</p>
					<a routerLink="/algs/pll">zobacz pll</a>
				</article>
			</div>
		</section>
	`,
	styles: [`
		:host {
			display: block;
			padding: 2rem 1rem 4rem;
			color: #111827;
		}

		.algs-page {
			max-width: 1200px;
			margin: 0 auto;
		}

		.hero {
			display: grid;
			gap: .75rem;
			padding: 1.5rem 0 2rem;
		}

		.eyebrow {
			margin: 0;
			text-transform: uppercase;
			letter-spacing: .28em;
			font-size: .8rem;
			color: #6b7280;
		}

		h1 {
			margin: 0;
			font-size: clamp(2.25rem, 4.5vw, 4.5rem);
			line-height: .95;
			letter-spacing: -.04em;
			max-width: 12ch;
		}

		.lead {
			margin: 0;
			max-width: 60ch;
			font-size: 1.05rem;
			line-height: 1.7;
			color: #4b5563;
		}

		.stages {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 1rem;
		}

		.stage-card {
			padding: 1.4rem;
			border: 1px solid rgba(17, 24, 39, .1);
			border-radius: 1.25rem;
			background: linear-gradient(180deg, rgba(255, 255, 255, .96), rgba(248, 250, 252, .92));
			box-shadow: 0 12px 30px rgba(15, 23, 42, .06);
		}

		.stage-card h2 {
			margin: 0 0 .5rem;
			font-size: 1.25rem;
			text-transform: uppercase;
			letter-spacing: .16em;
		}

		.stage-card p {
			margin: 0;
			color: #4b5563;
			line-height: 1.7;
		}

		.stage-card a {
			display: inline-block;
			margin-top: 1rem;
			font-weight: 700;
			text-decoration: none;
			color: #111827;
			border-bottom: 2px solid #111827;
			padding-bottom: .1rem;
		}

		@media (max-width: 760px) {
			.stages {
				grid-template-columns: 1fr;
			}
		}
	`]
})
export class AlgsComponent {}