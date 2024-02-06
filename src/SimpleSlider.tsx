import { useState, useEffect } from "react";
import { TweenMax, Power4 } from "gsap";
import Slider from "react-slick";
import { CursoArrayProps } from "./Interface";
import { textoNoticia, isNotMobile } from "./Utils";
import { browserName } from "react-device-detect";
import "./LoginModal.css";
import "./glyphs/style.css";

export function SimpleSlider(props: CursoArrayProps) {
	//Provavelmente isso aqui poderia ter sido melhor feito, mas como seriam
	//sempre 5 imagens no slider, foi mais fácil fazer assim.

	const [isModal, setModal] = useState([false]);

	//Ao clicar no box, definir o modal como ativo.
	//Ao clicar no 'x', ou fora do modal definir o modal como inativo.
	//O hook "Modal" tem um comentário na parte em que um clique fora
	//do modal o define como inativo, caso não esteja claro.

	//Ao clicar no box, definir o modal como ativo.
	const handleModalOpen = (m: number) => {
		if (!isNotMobile())
			window.history.pushState(
				"fake-route",
				document.title,
				window.location.href
			);
		const modalCopy = [...isModal];
		modalCopy[m] = true;
		setModal(modalCopy);
	};

	//Ao clicar no 'x', ou fora do modal definir o modal como inativo.
	const handleModalClose = (m: number) => {
		if (!isNotMobile()) window.history.back();
		const modalCopy = [...isModal];
		modalCopy[m] = false;
		setModal(modalCopy);
	};

	const active1 = isModal[0] ? "is-active" : "";
	const active2 = isModal[1] ? "is-active" : "";
	const active3 = isModal[2] ? "is-active" : "";
	const active4 = isModal[3] ? "is-active" : "";
	const active5 = isModal[4] ? "is-active" : "";

	function closeModal() {
		const modalFalse = Array(5).fill(false);
		setModal(modalFalse);
	}

	function hasNews(e: number) {
		if (props.Cursos[e].Noticia)
			return (
				<a
					href={props.Cursos[0].Noticia}
					target="_blank"
					rel="noopener noreferrer"
				>
					<button
						className="button is-info is-outlined"
						style={{
							whiteSpace: "pre-line",
						}}
					>
						{textoNoticia()}
					</button>
				</a>
			);
		else return <div></div>;
	}

	//Permite fechar o modal pressionando "Voltar" no navegador.
	useEffect(() => {
		//Mobile only.
		if (!isNotMobile()) {
			// Add a fake history event so that the back button does nothing if pressed once

			window.addEventListener("popstate", closeModal);

			// Here is the cleanup when this component unmounts
			return () => {
				window.removeEventListener("popstate", closeModal);
				// If we left without using the back button, aka by using a button on the page, we need to clear out that fake history event
				if (window.history.state === "fake-route") {
					window.history.back();
				}
			};
		} else return () => {};
	}, []);

	useEffect(() => {
		let modalCard: Element | null = null;
		let modalBackground: Element | null = null;
		const y = () => {
			if (browserName === "Chrome") return 0;
			else return 128;
		};
		if (isModal[0]) {
			modalCard = document.querySelector("#modalCardSlider0");
			modalBackground = document.querySelector("#modalBackgroundSlider0");
		} else if (isModal[1]) {
			modalCard = document.querySelector("#modalCardSlider1");
			modalBackground = document.querySelector("#modalBackgroundSlider1");
		} else if (isModal[2]) {
			modalCard = document.querySelector("#modalCardSlider2");
			modalBackground = document.querySelector("#modalBackgroundSlider2");
		} else if (isModal[3]) {
			modalCard = document.querySelector("#modalCardSlider3");
			modalBackground = document.querySelector("#modalBackgroundSlider3");
		} else if (isModal[4]) {
			modalCard = document.querySelector("#modalCardSlider4");
			modalBackground = document.querySelector("#modalBackgroundSlider4");
		}
		if (modalCard !== null && modalBackground !== null) {
			TweenMax.set(modalCard, { y: y, opacity: 0 });
			TweenMax.set(modalBackground, { opacity: 0 });
			TweenMax.fromTo(
				modalCard,
				0.65,
				{ y: y },
				{ y: 0, opacity: 1, ease: Power4.easeOut }
			);
			TweenMax.fromTo(
				modalBackground,
				0.45,
				{},
				{ opacity: 1, ease: Power4.easeOut }
			);
		}
	}, [isModal]);

	//Permite fechar o modal apertando ESC.
	useEffect(() => {
		const handleEsc = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				const modalFalse = Array(5).fill(false);
				setModal(modalFalse);
			}
		};
		window.addEventListener("keydown", handleEsc);

		return () => {
			window.removeEventListener("keydown", handleEsc);
		};
	}, []);

	const table = (i: number) => {
		if (props.Cursos[i].ListaParticipantes.length > 0)
			return (
				<table className="table is-fullwidth is-hoverable">
					<thead>
						<tr>
							<th className="has-text-centered">Nome</th>
							<th className="has-text-centered">Unidade</th>
						</tr>
					</thead>
					<tbody>{props.Cursos[i].ListaParticipantes}</tbody>
				</table>
			);
		else return <div></div>;
	};

	return (
		<div className="Modal">
			<div className={`modal ${active1}`}>
				<div
					id="modalBackgroundSlider0"
					className="modal-background"
					onClick={() => {
						handleModalClose(0);
					}}
				/>
				<div id="modalCardSlider0" className="modal-card">
					<header
						className="modal-card-head"
						style={{ backgroundColor: "#e6fcfc" }}
					>
						<p
							className="modal-card-title"
							style={{
								whiteSpace: "pre-line",
							}}
						>
							{props.Cursos[0].Titulo}
						</p>
						<button
							onClick={() => {
								handleModalClose(0);
							}}
							className="delete"
							aria-label="close"
						/>
					</header>
					<header style={{ backgroundColor: "#f7f7f7" }}>
						<p className="modal-card-title my-2">
							Instrutor: {props.Cursos[0].Instrutor}
						</p>
					</header>
					<section className="modal-card-body">
						<div className="buttons is-centered">{hasNews(0)}</div>
						<div>{props.Cursos[0].Imagens}</div>
						{table(0)}
					</section>
					<footer
						className="modal-card-foot"
						style={{ backgroundColor: "#e6fcfc" }}
					></footer>
				</div>
			</div>
			<div className={`modal ${active2}`}>
				<div
					id="modalBackgroundSlider1"
					className="modal-background"
					onClick={() => {
						handleModalClose(1);
					}}
				/>
				<div id="modalCardSlider1" className="modal-card">
					<header
						className="modal-card-head"
						style={{ backgroundColor: "#e6fcfc" }}
					>
						<p
							className="modal-card-title"
							style={{
								whiteSpace: "pre-line",
							}}
						>
							{props.Cursos[1].Titulo}
						</p>
						<button
							onClick={() => {
								handleModalClose(1);
							}}
							className="delete"
							aria-label="close"
						/>
					</header>
					<header style={{ backgroundColor: "#f7f7f7" }}>
						<p className="modal-card-title my-2">
							Instrutor: {props.Cursos[1].Instrutor}
						</p>
					</header>
					<section className="modal-card-body">
						<div className="buttons is-centered">{hasNews(1)}</div>
						<div>{props.Cursos[1].Imagens}</div>
						{table(1)}
					</section>
					<footer
						className="modal-card-foot"
						style={{ backgroundColor: "#e6fcfc" }}
					></footer>
				</div>
			</div>
			<div className={`modal ${active3}`}>
				<div
					id="modalBackgroundSlider2"
					className="modal-background"
					onClick={() => {
						handleModalClose(2);
					}}
				/>
				<div id="modalCardSlider2" className="modal-card">
					<header
						className="modal-card-head"
						style={{ backgroundColor: "#e6fcfc" }}
					>
						<p
							className="modal-card-title"
							style={{
								whiteSpace: "pre-line",
							}}
						>
							{props.Cursos[2].Titulo}
						</p>
						<button
							onClick={() => {
								handleModalClose(2);
							}}
							className="delete"
							aria-label="close"
						/>
					</header>
					<header style={{ backgroundColor: "#f7f7f7" }}>
						<p className="modal-card-title my-2">
							Instrutor: {props.Cursos[2].Instrutor}
						</p>
					</header>
					<section className="modal-card-body">
						<div className="buttons is-centered">{hasNews(2)}</div>
						<div>{props.Cursos[2].Imagens}</div>
						{table(2)}
					</section>
					<footer
						className="modal-card-foot"
						style={{ backgroundColor: "#e6fcfc" }}
					></footer>
				</div>
			</div>
			<div className={`modal ${active4}`}>
				<div
					id="modalBackgroundSlider3"
					className="modal-background"
					onClick={() => {
						handleModalClose(3);
					}}
				/>
				<div id="modalCardSlider3" className="modal-card">
					<header
						className="modal-card-head"
						style={{ backgroundColor: "#e6fcfc" }}
					>
						<p
							className="modal-card-title"
							style={{
								whiteSpace: "pre-line",
							}}
						>
							{props.Cursos[3].Titulo}
						</p>
						<button
							onClick={() => {
								handleModalClose(3);
							}}
							className="delete"
							aria-label="close"
						/>
					</header>
					<header style={{ backgroundColor: "#f7f7f7" }}>
						<p className="modal-card-title my-2">
							Instrutor: {props.Cursos[3].Instrutor}
						</p>
					</header>
					<section className="modal-card-body">
						<div className="buttons is-centered">{hasNews(3)}</div>
						<div>{props.Cursos[3].Imagens}</div>
						{table(3)}
					</section>
					<footer
						className="modal-card-foot"
						style={{ backgroundColor: "#e6fcfc" }}
					></footer>
				</div>
			</div>
			<div className={`modal ${active5}`}>
				<div
					id="modalBackgroundSlider4"
					className="modal-background"
					onClick={() => {
						handleModalClose(4);
					}}
				/>
				<div id="modalCardSlider4" className="modal-card">
					<header
						className="modal-card-head"
						style={{ backgroundColor: "#e6fcfc" }}
					>
						<p
							className="modal-card-title"
							style={{
								whiteSpace: "pre-line",
							}}
						>
							{props.Cursos[4].Titulo}
						</p>
						<button
							onClick={() => {
								handleModalClose(4);
							}}
							className="delete"
							aria-label="close"
						/>
					</header>
					<header style={{ backgroundColor: "#f7f7f7" }}>
						<p className="modal-card-title my-2">
							Instrutor: {props.Cursos[4].Instrutor}
						</p>
					</header>
					<section className="modal-card-body">
						<div className="buttons is-centered">{hasNews(4)}</div>
						<div>{props.Cursos[4].Imagens}</div>
						{table(4)}
					</section>
					<footer
						className="modal-card-foot"
						style={{ backgroundColor: "#e6fcfc" }}
					></footer>
				</div>
			</div>
			<Slider
				autoplay={true}
				dots={true}
				infinite={true}
				speed={500}
				slidesToShow={1}
				slidesToScroll={1}
			>
				<div>
					<img
						style={{ cursor: "pointer" }}
						src={props.Cursos[0].Imagem0}
						alt=""
						onClick={() => {
							handleModalOpen(0);
						}}
					></img>
				</div>
				<div>
					<img
						style={{ cursor: "pointer" }}
						src={props.Cursos[1].Imagem0}
						alt=""
						onClick={() => {
							handleModalOpen(1);
						}}
					></img>
				</div>
				<div>
					<img
						style={{ cursor: "pointer" }}
						src={props.Cursos[2].Imagem0}
						alt=""
						onClick={() => {
							handleModalOpen(2);
						}}
					></img>
				</div>
				<div>
					<img
						style={{ cursor: "pointer" }}
						src={props.Cursos[3].Imagem0}
						alt=""
						onClick={() => {
							handleModalOpen(3);
						}}
					></img>
				</div>
				<div>
					<img
						style={{ cursor: "pointer" }}
						src={props.Cursos[4].Imagem0}
						alt=""
						onClick={() => {
							handleModalOpen(4);
						}}
					></img>
				</div>
			</Slider>
		</div>
	);
}
