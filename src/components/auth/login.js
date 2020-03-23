import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./login.css";
import Main from "./../main/main";
import SimpleCrypto from "simple-crypto-js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const secret = "_villasecret";
const serverURL = "http://localhost:8000";

let crypto = new SimpleCrypto(secret);

export default class Login extends Component {
	state = {
		isLoading: false,
		logged: false,
		msg: "",
		msgClass: ""
	};

	constructor() {
		super();

		let now = Math.ceil(new Date().getTime() / 1000);

		if (localStorage.getItem("user")) {
			let user = JSON.parse(crypto.decrypt(localStorage.getItem("user")));

			if (user.expiresIn > now) {
				ReactDOM.render(<Main ref={(main) => {window.main = main}}/>, document.getElementById("root"));
			}
		}
	}

	submitLogin = async e => {
		e.preventDefault();

		this.setState({
			isLoading: true,
			msg: ""
		});

		await axios
			.post(
				serverURL + "/login",
				{
					email: document.getElementById("email").value,
					password: document.getElementById("password").value
				},
				{
					headers: {
						"Content-Type": "application/json"
					}
				}
			)
			.then(res => {
				console.log(res);
				switch (res.data.result) {
					case "OK":
						this.setState({
							isLoading: true,
							logged: true,
							msg: "Bienvenido!!!",
							msgClass: "success"
						});

						let expiresIn = Math.ceil(new Date().getTime() / 1000) + 86400;
						let user = res.data.user;
						user.expiresIn = expiresIn;
						localStorage.setItem("user", crypto.encrypt(user));

						setTimeout(function() {
							ReactDOM.render(<Main />, document.getElementById("root"));
						}, 2000);
						break;
					case "NO USER":
						this.setState({
							isLoading: false,
							msg: "Usuario no registrado",
							msgClass: "error"
						});
						break;
					case "NO PASS":
						this.setState({
							isLoading: false,
							msg: "Contraseña incorrecta",
							msgClass: "error"
						});
						break;
					case "ERROR":
						this.setState({
							isLoading: false,
							msg: "Ocurrió un error en el servidor",
							msgClass: "error"
						});
						break;
					default:
						break;
				}
			})
			.catch(e => {
				this.setState({
					isLoading: false,
					msg: "Ocurrió un error en el servidor",
					msgClass: "error"
				});
			});
	};

	render() {
		return (
			<div className="main-container">
				<div className="logo-container">
					<img src="img/logo2.svg" alt="villatracking logo" />
				</div>

				<div className="login-form">
					<h3>Iniciar Sesi&oacute;n</h3>

					<form onSubmit={this.submitLogin}>
						<input
							data-type="email"
							type="email"
							id="email"
							name="email"
							placeholder="Correo electrónico"
							required
							disabled={this.state.isLoading ? true : false}
						/>
						<input
							type="password"
							id="password"
							name="password"
							placeholder="Contraseña"
							required
							disabled={this.state.isLoading ? true : false}
						/>

						<div className="submit">
							<input
								type="submit"
								name="submit"
								value="Ingresar"
								disabled={this.state.isLoading ? true : false}
							/>
							<a href="#" className={this.state.isLoading ? "loading" : ""}>
								Olvidó su contraseña?
							</a>
							<div
								id="loading"
								className={
									this.state.isLoading && !this.state.logged
										? "shown"
										: "hidden"
								}
							>
								<FontAwesomeIcon className="fa-spin" icon={faSpinner} />
							</div>
						</div>
					</form>
					<div className="msg">
						<div className={this.state.msgClass}>{this.state.msg}</div>
					</div>
				</div>
			</div>
		);
	}
}
