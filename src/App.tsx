import { useState, useEffect } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { Curso, CursoFromJson, Participante } from "./Interface";
import { SimpleSlider } from "./SimpleSlider";
import { Modal } from "./Modal";
import { LoginModal } from "./LoginModal";
import { LogoutButton } from "./LogoutButton";
import { UpdatePasswordModal } from "./UpdatePasswordModal";
import {
	importAll,
	widthIfMobile,
	heightIfMobile,
	authExpiration,
} from "./Utils";
import { ReactComponent as Triskele } from "./glyphs/triskele.svg";
import "bulma/css/bulma.css";
//Se App.css for aqui, itens da lista possuem sombra, mas animação de hover
//não funciona (não testei isso após mudar um pouco o css com mais de sombras).
import "bulma/css/bulma.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./App.css";

function App() {
	//Todos os cursos.
	const [cursosTable, setCursosTable] = useState<Array<React.ReactElement>>(
		[]
	);
	//Últimos 5 cursos.
	const [cursosRecentes, setCursosRecentes] = useState<Array<Curso>>([]);
	//Variável para evitar crash, ver fim de useEffect{}.
	const [loading, setLoading] = useState(true);

	const [loggedIn, setLoggedIn] = useState(true);

	useEffect(() => {
		// GET request using fetch inside useEffect React hook

		const access_token = authExpiration()!;

		//Versão otimizada.
		fetch("http://cosi.mppr:8080/api/test/admin", {
			headers: {
				"Content-type": "application/json; charset=UTF-8",
				"x-access-token": access_token,
				//"Access-Control-Allow-Origin": "http://10.56.14.26:3000",
			},
			cache: "no-store",
		})
			.then((response) => {
				return response.json();
			})
			.then((jsonFile) => {
				//Eu preferiria não ter usado esse require aqui, mas o
				//LazyLoadImage se recusa a aceitar imagens da forma
				//./img/curso/Curso Exemplo/img.jpg na parte de placeholders.
				//true é para buscar recursivamente em todos os
				//diretórios.
				const contexto = require.context(
					"../public/img/curso_compressed",
					true,
					/\.(png|jpe?g|svg)$/
				);
				//Transformar o contexto em algo que o LazyLoadImage aceite.
				const placeholders = importAll(contexto);

				//Lista de Modals.
				const updatedCursosTable: Array<React.ReactElement> = [];
				//Lista com as informações de cada curso.
				const cursosData: Array<Curso> = [];

				let placeholder_index = 0;
				let i = 0;
				let k = -1;
				//Iterar por cada curso recebido do .json
				jsonFile.forEach((item: CursoFromJson, jsonIndex: number) => {
					const listaParticipantes: Array<React.ReactElement> = [];
					if (item.Participantes) {
						item.Participantes.forEach(
							(p: Participante, index: number) => {
								listaParticipantes.push(
									<tr
										key={
											"p" +
											jsonIndex.toString() +
											index.toString()
										}
									>
										<td>{p.Nome}</td>
										<td>{p.Unidade}</td>
									</tr>
								);
							}
						);
					}

					let img0 = "";
					const listaImagens: Array<React.ReactElement> = [];
					item.Imagens.forEach((img: string, index: number) => {
						const imgSrc =
							"/img/curso/" +
							i.toString() +
							" - " +
							item.Curso +
							"/" +
							img;
						if (index === 0) img0 = imgSrc;
						const placeholder: string = placeholders[
							placeholder_index
						] as string;
						placeholder_index++;
						listaImagens.push(
							<LazyLoadImage
								key={index.toString() + img}
								src={imgSrc}
								placeholderSrc={placeholder}
								width={widthIfMobile()}
								height={heightIfMobile()}
								effect="blur"
								alt=""
								loading="lazy"
							></LazyLoadImage>
						);
					});

					if (!img0) {
						img0 = "/img/no_image.png";
					}

					let titulo = item.Curso;
					cursosData.push({
						Titulo: titulo,
						Data: item.Data,
						Semestre: item.Semestre,
						Instrutor: item.Instrutor,
						Participantes: item.NumeroParticipantes,
						ListaParticipantes: listaParticipantes,
						ListaParticipantesDados: item.Participantes,
						Imagens: listaImagens,
						ImagensPath: item.Imagens,
						Noticia: item.Noticia,
						Cor: "azure",
						Index: i,
						Imagem0: img0,
					});
					if (i % 2 === 0) cursosData[i].Cor = "#f7ffff";

					//Isso aqui provavelmente tem que mudar, fiz só pra ter
					//uma separação simples entre semestres.
					if (k !== -1)
						if (item.Semestre !== cursosData[k].Semestre)
							updatedCursosTable.push(
								<div key={cursosData[k].Semestre}>
									<div>&nbsp;</div>
									<div>
										<strong>
											{"Semestre: " +
												cursosData[k].Semestre}
										</strong>
									</div>
								</div>
							);

					//Inserir um elemento na lista, com as informações coletadas
					//até aqui (Curso={item}).
					updatedCursosTable.push(
						<Modal
							Curso={cursosData[i]}
							key={"modal" + jsonIndex.toString()}
						></Modal>
					);
					i++;
					k++;
				});
				//Inserir atualização que ficou faltando nos semestres
				//(novamente, tem que mudar isso).
				updatedCursosTable.push(
					<div key={cursosData[cursosData.length - 1].Semestre}>
						<strong>
							{"Semestre: " +
								cursosData[cursosData.length - 1].Semestre}
						</strong>
					</div>
				);
				//Inserir os últimos 5 cursos da lista de cursos em uma
				//outra lista de cursos mais recentes (essa lista é usada
				//no scroll das imagens dos cursos mais recentes).
				i--;
				const j = i - 5;
				const tempCursosRecentes: Array<Curso> = [];
				for (i; i > j; i--) {
					tempCursosRecentes.push(cursosData[i]);
				}
				setCursosRecentes(tempCursosRecentes);
				//Cursos vão estar do mais antigo ao mais recente, então
				//é preciso inverter a lista.
				setCursosTable(updatedCursosTable.reverse());
				//Enquanto essa função ainda não houver terminado a execução,
				//se o React tentar renderizar simple_slider com cursosRecentes
				//definido como um array vazio, vai crashar a página. Então
				//é necessário um if que verifica o valor dessa variável,
				//para decidir se será impresso um texto de loading ou o slider.
				if (access_token === undefined) setLoggedIn(false);
				setLoading(false);
			});

		// empty dependency array means this effect will only run once (like componentDidMount in classes)
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const simple_slider = <SimpleSlider Cursos={cursosRecentes}></SimpleSlider>;
	return (
		<div className="App">
			{/*Parte de cima da página (header).*/}
			<div className="block">
				<section className="section">
					<div className="container">
						<a href="https://www.pmpr.pr.gov.br/">
							<img
								className="pmpr"
								src="/img/pmpr.png"
								alt="Clique aqui para ir à página da PMPR"
								title="Clique aqui para ir à página da PMPR"
							/>
						</a>
					</div>
					<div className="container">
						<a href="https://intranet.mppr.mp.br/Pagina/Coordenadoria-de-Seguranca-Institucional">
							<img
								className="cosi"
								src="/img/topo.png"
								alt="Clique aqui para ir à página da COSI"
								title="Clique aqui para ir à página da COSI"
							/>
						</a>
					</div>

					<div className="container">
						<h1 className="title header">Cursos e instruções</h1>
					</div>
				</section>
				<section className="separator">
					{loggedIn ? (
						loading ? (
							<div>&nbsp;</div>
						) : (
							<div>
								<UpdatePasswordModal></UpdatePasswordModal>
								<LogoutButton></LogoutButton>
							</div>
						)
					) : (
						<LoginModal></LoginModal>
					)}
				</section>
			</div>
			{/*Slider dos 5 cursos mais recentes.*/}
			<div className="block">
				<div className="card is-shadowless">
					<div className="card-image sliderBackground">
						<div
							className="slider"
							onClick={() => setLoading(false)}
						>
							{
								/*Ver linha 196.*/
								loading
									? "carregando... caso demore demais, clique"
									: simple_slider
							}
						</div>
					</div>
				</div>
			</div>

			{/*Boxes com os cursos.*/}
			{cursosTable}

			{/*Triskele e fim da página.*/}
			<div className="triskele">
				<Triskele />
			</div>
			<section className="separatorFooter">
				<div>&nbsp;</div>
			</section>
		</div>
	);
}

export default App;
