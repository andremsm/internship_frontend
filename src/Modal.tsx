import { useState, useEffect } from "react";
//import { useNavigate } from "react-router-dom";
import { TweenMax, Power4 } from "gsap";
import { CursoProps } from "./Interface";
import {
	isLongString,
	sizeBoxesMobile,
	textoNoticia,
	isNotMobile,
} from "./Utils";
import "./LoginModal.css";
import "./glyphs/style.css";
import { browserName } from "react-device-detect";

export function Modal(props: CursoProps) {
	//Para mais informações, ver como o as classes funcionam no site do Bulma,
	//principalmente a classe "Modal".

	const [isModal, setModal] = useState(false);
	const [fileList, setFileList] = useState<FileList | null>(null);
	const [hasFilesUploaded, setHasFilesUploaded] = useState(false);

	const handleFileUpload = (e: any) => {
		setFileList(e.target.files);
		console.log(e.target.files);
		if (e.target.files.length !== 0) setHasFilesUploaded(true);
		else setHasFilesUploaded(false);
	};

	//Ao clicar no box, definir o modal como ativo.
	const handleModalOpen = () => {
		if (!isNotMobile())
			window.history.pushState(
				"fake-route",
				document.title,
				window.location.href
			);
		setModal(true);
	};

	//Ao clicar no 'x', ou fora do modal definir o modal como inativo.
	const handleModalClose = () => {
		if (!isNotMobile()) window.history.back();
		setModal(false);
	};

	const sendImages = () => {
		console.log("sending images...");
		if (!fileList) return;

		const data = new FormData();
		files.forEach((file, index) => {
			data.append(`file-${index}`, file, file.name);
		});

		console.log(data);
		console.log("fetching...");
	};

	function closeModal() {
		setModal(false);
	}

	function hasFiles() {
		if (hasFilesUploaded)
			return (
				<button
					className="button is-info is-outlined"
					style={{
						whiteSpace: "pre-line",
					}}
					onClick={sendImages}
				>
					Enviar imagens
				</button>
			);
		else return <div></div>;
	}

	function hasNews() {
		if (props.Curso.Noticia)
			return (
				<a
					href={props.Curso.Noticia}
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

	const active = isModal ? "is-active" : "";

	//Permite fechar o modal apertando ESC.
	useEffect(() => {
		const handleEsc = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setModal(false);
			}
		};
		window.addEventListener("keydown", handleEsc);

		return () => {
			window.removeEventListener("keydown", handleEsc);
		};
	}, []);

	useEffect(() => {
		if (isModal) {
			const cardString = `#modalCard${props.Curso.Index}`;
			const backgroundString = `#modalBackground${props.Curso.Index}`;
			const modalCard = document.querySelector(cardString);
			const modalBackground = document.querySelector(backgroundString);
			const y = () => {
				if (browserName === "Chrome") return 0;
				else return 128;
			};
			//y: 128
			TweenMax.set(modalCard, { y: y, opacity: 0 });
			TweenMax.set(modalBackground, { opacity: 0 });
			TweenMax.fromTo(
				modalCard,
				0.65,
				//y: 128
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
	}, [isModal, props.Curso.Index]);

	const table = () => {
		if (props.Curso.ListaParticipantes.length > 0)
			return (
				<table className="table is-fullwidth is-hoverable">
					<thead>
						<tr>
							<th className="has-text-centered">Nome</th>
							<th className="has-text-centered">Unidade</th>
						</tr>
					</thead>
					<tbody>{props.Curso.ListaParticipantes}</tbody>
				</table>
			);
		else return <div></div>;
	};

	// files is not an array, but it's iterable, spread to get an array of files
	const files = fileList ? [...fileList] : [];

	return (
		<div className="Modal">
			<div className={`modal ${active}`}>
				{/*O handleClick abaixo serve para permitir que o modal
				possa ser fechado ao clicar fora dele.*/}
				<div
					id={`modalBackground${props.Curso.Index}`}
					className="modal-background"
					onClick={handleModalClose}
				/>
				<div
					id={`modalCard${props.Curso.Index}`}
					className="modal-card"
				>
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
							{props.Curso.Titulo}
						</p>
						<button
							onClick={handleModalClose}
							className="delete"
							aria-label="close"
						/>
					</header>
					<header style={{ backgroundColor: "#f7f7f7" }}>
						<p className="modal-card-title my-2">
							Instrutor: {props.Curso.Instrutor}
						</p>
					</header>
					<section className="modal-card-body">
						<div className="buttons is-centered">{hasNews()}</div>

						<div>{props.Curso.Imagens}</div>

						{/*put this part inside if_logged_in() */}
						<div>&nbsp;</div>
						<label htmlFor="upload-images">
							<b>Upload de imagens&nbsp;</b>
						</label>
						<input
							type="file"
							id="upload-images"
							multiple
							onChange={handleFileUpload}
						/>
						{hasFiles()}
						<div>&nbsp;</div>

						{table()}
					</section>
					<footer
						className="modal-card-foot"
						style={{ backgroundColor: "#e6fcfc" }}
					></footer>
				</div>
			</div>
			<div className="block mx-6 mb-0">
				<div className="columns is-centered">
					<div className="column is-two-thirds">
						<div
							onClick={handleModalOpen}
							className={
								"box" + sizeBoxesMobile() + "bhover clickable"
							}
							style={{
								backgroundColor: props.Curso.Cor,
							}}
						>
							<div className="rrow">
								<div className="ccolumn has-text-centered">
									<p
										className={
											isLongString(
												props.Curso.Titulo,
												"Nunito",
												0
											) + "stext"
										}
									>
										<strong>{props.Curso.Titulo}</strong>
									</p>
								</div>
								<div className="ccolumn has-text-centered">
									<p
										className={
											isLongString(
												props.Curso.Titulo,
												"Nunito",
												1
											) + "stext"
										}
									>
										{props.Curso.Participantes +
											" participantes"}
									</p>
								</div>
								<div className="ccolumn has-text-centered">
									<p
										className={
											isLongString(
												props.Curso.Titulo,
												"Nunito",
												2
											) + "stext"
										}
									>
										{props.Curso.Data}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
