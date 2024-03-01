class CodeDemo extends HTMLElement {
	constructor() {
		super()

		// Ensure shadow root (missing likely because declarative shadow dom is not supported)
		if (!this.attachInternals().shadowRoot) {
			const template = this.querySelector("template[shadowrootmode]")

			if (!template) {
				throw new Error("Missing component template")
			}

			const shadow = this.attachShadow({
				mode: template.getAttribute("shadowrootmode")
			});

			shadow.appendChild(template.content)
			template.remove()
		}
	}

	connectedCallback() {
		const code = {
			html: "",
			css: "",
			js: "",
		}

		for (const lang of ["html", "css", "js"]) {
			const nodes = this.shadowRoot.querySelector(`slot[name=${lang}]`).assignedNodes()

			code[lang] = Array.from(nodes)
				.flatMap(node => Array.from(node.querySelectorAll("code"))) // find code elements
				.map(code => code.textContent) // textContent seems to transform htmlentities
				.join("\n\n")
		}

		// We could get console.log calls from the iframe by monkey patching it and sending back data ?
		this.shadowRoot.getElementById("output").srcdoc = `
			<!DOCTYPE html>
			<html>
				<head>
					<style>${code.css}</style>
					<script type="module">${code.js}</${'script'}>
				</head>
				<body>${code.html}</body>
			</html>
		`;
	}
}

customElements.define("code-showcase", CodeDemo)
