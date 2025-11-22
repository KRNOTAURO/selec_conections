# SSH Connection Manager (selec_srv)

Un gestor de conexiones SSH interactivo y fácil de usar para tu terminal. Olvídate de recordar direcciones IP, usuarios y puertos; simplemente selecciona y conecta.

## Características

- **Menú Interactivo**: Selecciona tus servidores de una lista navegable.
- **Búsqueda Inteligente**: Filtra conexiones escribiendo parte del nombre.
- **Gestión desde CLI**: Agrega y elimina conexiones directamente desde el menú.
- **Conexión Directa**: Usa argumentos para conectar rápidamente (ej. `conect myserver`).
- **Validación**: Verifica que tus comandos SSH sean válidos.
- **Persistencia**: Las conexiones se guardan en un archivo local `dir.txt`.

## Instalación

1. **Clonar el repositorio** (o descargar los archivos):
   ```bash
   git clone <url-del-repo>
   cd select_conection
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Enlazar globalmente** (Opcional, para usar el comando `conect` en cualquier lugar):
   ```bash
   npm link
   ```

## Uso

### Modo Interactivo
Simplemente ejecuta el comando sin argumentos:

```bash
conect
# O si no usaste npm link:
node seleccionar.js
```

Aparecerá un menú donde puedes:
- Escribir para buscar una conexión.
- Usar las flechas para navegar.
- Seleccionar **"➕ Agregar nueva conexión"** para guardar un nuevo servidor.
- Seleccionar **"🗑️ Eliminar conexión"** para borrar uno existente.
- Seleccionar **"❌ Cancelar"** para salir.

### Modo Directo
Si ya conoces el nombre de la conexión guardada, puedes ir directo:

```bash
conect produccion
```

Si te equivocas en el nombre, el script te sugerirá opciones similares.

## Configuración

Las conexiones se almacenan en un archivo `dir.txt` en la raíz del proyecto. Es un archivo JSON simple:

```json
{
    "produccion": "ssh root@192.168.1.100",
    "staging": "ssh dev@staging.example.com -p 2222",
    "aws-server": "ssh -i key.pem ubuntu@aws-ip"
}
```

Puedes editar este archivo manualmente o usar las opciones del menú.

## Requisitos

- Node.js (v14 o superior recomendado)
- Cliente SSH instalado en tu sistema.
