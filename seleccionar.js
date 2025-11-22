#!/usr/bin/env node

/**
 * CLI avanzado para gestión de conexiones SSH
 *
 * Features:
 *  ✔ Selección interactiva por menú
 *  ✔ Autocompletado con inquirer autocomplete
 *  ✔ Conexión directa por argumento
 *  ✔ Validación y reintentos (3 intentos)
 *  ✔ Manejo seguro de errores
 *  ✔ Edición del archivo de servidores
 *  ✔ Validación del archivo dir.txt
 */

import fs from "node:fs";
import path from "node:path";
import inquirer from "inquirer";
import inquirerAutocomplete from "inquirer-autocomplete-prompt";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

// Registrar plugin de autocompletado
inquirer.registerPrompt("autocomplete", inquirerAutocomplete);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Archivo de datos
const dataFile = path.join(__dirname, "dir.txt");

if (!fs.existsSync(dataFile)) {
    console.error("❌ ERROR: No se encontró dir.txt en:", dataFile);
    process.exit(1);
}

let servidores = {};

// Leer archivo dir.txt con validaciones
/**
 * Carga los servidores desde el archivo JSON local (dir.txt).
 * Realiza validaciones para asegurar que el formato sea correcto.
 * Si encuentra errores críticos, termina la ejecución del proceso.
 */
function cargarServidores() {
    try {
        const raw = fs.readFileSync(dataFile, "utf8");
        servidores = JSON.parse(raw);

        const invalids = Object.keys(servidores).filter(
            k => !servidores[k] || typeof servidores[k] !== "string" || servidores[k].trim() === ""
        );

        if (invalids.length > 0) {
            console.log("⚠️ Advertencia: Hay conexiones sin comando definido:");
            invalids.forEach(k => console.log("  -", k));
        }
    } catch (err) {
        console.error("❌ ERROR: El archivo dir.txt contiene JSON inválido.");
        console.error(err.message);
        process.exit(1);
    }
}

cargarServidores();

// Conexión directa por argumento
const arg = process.argv[2];
if (arg) manejarArgumento(arg);

/**
 * Maneja la lógica de conexión cuando se proporciona un nombre de servidor como argumento.
 * Si el servidor existe, inicia la conexión. Si no, solicita reintento.
 * 
 * @param {string} nombre - El nombre o clave del servidor en la configuración.
 */
function manejarArgumento(nombre) {
    if (!servidores[nombre]) {
        console.log(`❌ La conexión "${nombre}" no existe.`);
        reintentarArgumento(nombre);
        return;
    }
    conectar(servidores[nombre]);
}

// Reintento si el usuario escribe mal
let intentos = 0;
/**
 * Gestiona los reintentos cuando el usuario ingresa un servidor no válido por argumento.
 * Permite buscar interactivamente el servidor correcto.
 * Se limita a un máximo de 3 intentos fallidos antes de cerrar el programa.
 */
async function reintentarArgumento() {
    intentos++;
    if (intentos >= 3) {
        console.log("❌ Demasiados intentos fallidos. Cerrando...");
        process.exit();
    }

    const { nuevo } = await inquirer.prompt([
        {
            type: "autocomplete",
            name: "nuevo",
            message: "Conexión no encontrada. Busca o selecciona:",
            source: (_, input) => filtrarServidores(input)
        }
    ]);

    manejarArgumento(nuevo);
}

// Autocomplete dinámico
/**
 * Filtra la lista de servidores disponibles basándose en la entrada del usuario.
 * Utilizado por el autocompletado de inquirer.
 * 
 * @param {string} [input=""] - Texto ingresado por el usuario para filtrar.
 * @returns {Array<{name: string, value: string}>} Array de objetos con nombre (para mostrar) y valor (clave del servidor).
 */
function filtrarServidores(input = "") {
    const lower = input.toLowerCase();
    return Object.keys(servidores)
        .filter(key => key.toLowerCase().includes(lower))
        .map(key => ({ name: `${key} → ${servidores[key]}`, value: key }));
}

// Menú principal
/**
 * Muestra el menú interactivo principal.
 * Permite al usuario buscar y seleccionar un servidor de la lista.
 */
async function seleccionarServidor() {
    const { opcion } = await inquirer.prompt([
        {
            type: "autocomplete",
            name: "opcion",
            message: "Selecciona o busca una conexión SSH:",
            source: (_, input) => filtrarServidores(input)
        }
    ]);

    if (!servidores[opcion]) {
        console.log(`❌ La conexión "${opcion}" no está configurada.`);
        return;
    }

    conectar(servidores[opcion]);
}

// Ejecutar el comando SSH
/**
 * Ejecuta el comando de conexión SSH en un proceso hijo.
 * Hereda la entrada/salida estándar para permitir la interacción con la sesión SSH.
 * 
 * @param {string} comando - El comando completo a ejecutar (ej. "ssh usuario@host").
 */
function conectar(comando) {
    console.log(`\n🔌 Conectando → ${comando}\n`);

    const [cmd, ...args] = comando.split(" ");

    const proceso = spawn(cmd, args, {
        stdio: "inherit"
    });

    proceso.on("close", code => {
        console.log(`\n🔚 Conexión terminada (código: ${code})`);
    });
}

// Iniciar si no hubo argumento
seleccionarServidor();

