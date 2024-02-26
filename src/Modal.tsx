import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
//import { useNavigate } from "react-router-dom";
import { TweenMax, Power4 } from "gsap";
import { CursoProps } from "./Interface";
import {
	isLongString,
	sizeBoxesMobile,
	textoNoticia,
	getCurrentUser,
	authExpiration,
} from "./Utils";
import "./LoginModal.css";
import "./glyphs/style.css";
import { browserName } from "react-device-detect";

export function Modal(props: CursoProps) {
	//Para mais informações, ver como o as classes funcionam no site do Bulma,
	//principalmente a classe "Modal".

	const [isOuterModal, setOuterModal] = useState(false);
	const [isInnerModal, setInnerModal] = useState(false);
	const [fileList, setFileList] = useState<FileList | null>(null);
	const [hasFilesUploaded, setHasFilesUploaded] = useState(false);
	//const [innerModalActive, setInnerModalActive] = useState(false);

	const [selectedThumbs, setSelectedThumbs] = useState<Array<string>>([]);

	const [queryParams] = useSearchParams();
	const navigate = useNavigate();

	const handleFileUpload = (e: any) => {
		setFileList(e.target.files);
		//console.log(e.target.files);
		if (e.target.files.length !== 0) setHasFilesUploaded(true);
		else setHasFilesUploaded(false);
	};

	//Ao clicar no box, definir o modal como ativo.
	const handleOuterModalOpen = () => {
		window.history.pushState(
			"fake-route",
			document.title,
			`?course=${props.Curso.Titulo}`
		);
		setOuterModal(true);
		//console.log("outer modal open");
	};

	const handleInnerModalOpen = () => {
		window.history.pushState(
			"fake-route",
			document.title,
			`?course=${props.Curso.Titulo}`
		);
		setInnerModal(true);
		//console.log("inner modal open");
		//console.log(isInnerModal);
	};

	//Ao clicar no 'x', ou fora do modal definir o modal como inativo.
	const handleOuterModalClose = () => {
		window.history.back();

		//console.log("outer modal close");
	};

	const handleInnerModalClose = () => {
		window.history.back();
		setSelectedThumbs([]);

		//console.log("inner modal close");
	};

	const sendImages = () => {
		//console.log("sending images...");
		if (!fileList) return;

		const access_token = authExpiration!() as string;

		const data = new FormData();
		data.append("title", props.Curso.Titulo);
		data.append("folderName", props.Curso.Folder);

		files.forEach((file, index) => {
			data.append(`file-${index}`, file, file.name);
		});

		//console.log(data);
		//console.log("fetching...");

		fetch("http://cosi.mppr:8080/api/img/upload", {
			method: "POST",
			headers: {
				"x-access-token": access_token,
			},
			body: data,
		})
			.then((res) => res.json())
			.then((data) => console.log(data))
			.catch((err) => console.log(err));
		window.location.reload();
	};

	function closeModal() {
		console.log("closing modal through back button");
		console.log(isInnerModal, isOuterModal);
		if (isInnerModal && isOuterModal) {
			console.log("closing inner modal through back button");
			setInnerModal(false);
		} else if (!isInnerModal && isOuterModal) {
			console.log("closing outer modal through back button");
			console.log(isInnerModal);
			console.log(isOuterModal);
			setOuterModal(false);
		}
	}

	function hasFiles() {
		if (hasFilesUploaded)
			return (
				<button
					name="imageUpload"
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

	function uploadImagesButton() {
		if (getCurrentUser())
			return (
				<div>
					<div>&nbsp;</div>
					<label htmlFor="upload-images">
						<b>Upload de imagens&nbsp;</b>
					</label>
					<input
						//name="imageUpload"
						type="file"
						accept="image/*"
						id="upload-images"
						multiple
						onChange={handleFileUpload}
					/>
					{hasFiles()}
					<div>&nbsp;</div>
				</div>
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

	const handleSelectThumb = (item: string) => {
		const check = selectedThumbs.includes(item);
		if (check) {
			const updatedList = selectedThumbs.filter(
				(thumb) => thumb !== item
			);
			setSelectedThumbs(updatedList);
		} else {
			setSelectedThumbs([...selectedThumbs, item]);
		}
	};

	const imgThumbs = () => {
		const imgTable: any = [];
		props.Curso.ImagensPath.forEach((item: string, index: number) => {
			const itemStr = `${props.Curso.Index} - ${props.Curso.Titulo}/${item}`;
			const isSelected = selectedThumbs.includes(itemStr);
			imgTable.push(
				<td
					key={`imgThumb${props.Curso.Titulo}_${item}`}
					style={{ padding: "10px" }}
				>
					<img
						src={`img/curso_compressed/${itemStr}`}
						alt={`${item}`}
						id={itemStr}
						className={
							"clickable " + (isSelected ? "img-selected" : "")
						}
						onClick={() => handleSelectThumb(itemStr)}
					></img>
				</td>
			);
		});
		return imgTable;
	};

	const sendRemoveImages = () => {
		//console.log(selectedThumbs);
		//console.log("sending images to delete...");
		if (selectedThumbs.length < 1) {
			//console.log("fail");
			return;
		}

		const access_token = authExpiration!() as string;

		const data = new FormData();
		data.append("title", props.Curso.Titulo);
		data.append("folderName", props.Curso.Folder);
		data.append(
			"imageList",
			JSON.stringify(
				selectedThumbs.map((item) => {
					return item.split("/").slice(-1);
				})
			)
		);

		//console.log(data);
		//console.log("fetching...");

		fetch("http://cosi.mppr:8080/api/img/delete", {
			method: "POST",
			headers: {
				"x-access-token": access_token,
			},
			body: data,
		})
			.then((res) => res.json())
			.then((data) => console.log(data))
			.catch((err) => console.log(err));

		handleInnerModalClose();
		handleOuterModalClose();
		window.location.reload();
	};

	const removeImagesModal = () => {
		if (getCurrentUser())
			return (
				<div className={`modal ${activeInner}`}>
					{/*O handleClick abaixo serve para permitir que o modal
					possa ser fechado ao clicar fora dele.*/}
					<div
						id={`modalBackground${props.Curso.Index}i`}
						className="modal-background"
						onClick={handleInnerModalClose}
					/>
					<div
						id={`modalCard${props.Curso.Index}i`}
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
								onClick={handleInnerModalClose}
								className="delete"
								aria-label="close"
							/>
						</header>
						<header style={{ backgroundColor: "#f7f7f7" }}>
							<p className="modal-card-title my-2">
								Remover imagens
							</p>
						</header>
						<section className="modal-card-body">
							<table className="buttons is-centered">
								<tbody>
									<tr>{imgThumbs()}</tr>
								</tbody>
							</table>

							<div className="buttons is-centered">
								<button
									className="button is-info"
									style={{
										whiteSpace: "pre-line",
									}}
									onClick={sendRemoveImages}
								>
									Remover imagens
								</button>
							</div>

							{/*put this part inside if_logged_in() */}
						</section>
						<footer
							className="modal-card-foot"
							style={{ backgroundColor: "#e6fcfc" }}
						></footer>
					</div>
				</div>
			);
		else return <div></div>;
	};

	const removeImagesButton = () => {
		if (getCurrentUser() && props.Curso.ImagensPath.length > 0)
			return (
				<div className="buttons is-centered">
					<button
						className="button is-info"
						style={{
							whiteSpace: "pre-line",
						}}
						onClick={handleInnerModalOpen}
					>
						Remover imagens
					</button>
				</div>
			);
		else return <div></div>;
	};

	//Permite fechar o modal pressionando "Voltar" no navegador.
	useEffect(() => {
		//Mobile only.
		if (true) {
			const handleBack = () => {
				if (isInnerModal && isOuterModal) setInnerModal(false);
				else if (!isInnerModal && isOuterModal) setOuterModal(false);
			};

			// Add a fake history event so that the back button does nothing if pressed once

			window.addEventListener("popstate", handleBack);

			// Here is the cleanup when this component unmounts
			return () => {
				window.removeEventListener("popstate", handleBack);
				// If we left without using the back button, aka by using a button on the page, we need to clear out that fake history event
				if (window.history.state === "fake-route") {
					// this was previously working, but now it doesn't for some reason
					// this might lead to some problems
					//window.history.back();
				}
			};
		} else return () => {};
	}, [isInnerModal, isOuterModal]);

	const activeOuter = isOuterModal ? "is-active" : "";
	const activeInner = isInnerModal ? "is-active" : "";

	//Permite fechar o modal apertando ESC.
	useEffect(() => {
		const handleEsc = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				//console.log("esc");
				if (isInnerModal && isOuterModal) {
					//console.log("esc inner");
					window.history.back();
				} else if (!isInnerModal && isOuterModal) {
					//console.log("esc outer");
					window.history.back();
				}
			}
		};
		window.addEventListener("keydown", handleEsc);

		return () => {
			window.removeEventListener("keydown", handleEsc);
		};
	}, [isInnerModal, isOuterModal]);

	useEffect(() => {
		const courseURL = queryParams.get("course");
		//console.log(courseURL);
		if (courseURL === props.Curso.Titulo) {
			navigate("/", { replace: true });
			window.history.pushState(
				"fake-route",
				document.title,
				`?course=${props.Curso.Titulo}`
			);
			//handleOuterModalOpen();
			setOuterModal(true);
		}
	}, []);

	useEffect(() => {
		if (isOuterModal) {
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
	}, [isOuterModal, props.Curso.Index]);

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

	//const modal_padding = innerModalActive ? "0 33%" : "0";

	return (
		<div className="Modal">
			<div
				className={`modal ${activeOuter}`}
				id={`idModalMain${props.Curso.Index}`}
			>
				{/*O handleClick abaixo serve para permitir que o modal
				possa ser fechado ao clicar fora dele.*/}
				<div
					id={`modalBackground${props.Curso.Index}`}
					className="modal-background"
					onClick={handleOuterModalClose}
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
							onClick={handleOuterModalClose}
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
						{uploadImagesButton()}

						{/*button to open inner modal*/}
						{removeImagesButton()}

						{table()}
					</section>
					<footer
						className="modal-card-foot"
						style={{ backgroundColor: "#e6fcfc" }}
					></footer>
				</div>
			</div>
			{/*inner modal*/}
			{removeImagesModal()}

			<div className="block mx-6 mb-0">
				<div className="columns is-centered">
					<div className="column is-two-thirds">
						<div
							onClick={handleOuterModalOpen}
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
