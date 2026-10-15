# Bastión de Mando

Constructor de listas y compañero de batalla para **Warhammer 40.000 (11.ª edición)**.
Monta tus ejércitos con los puntos al día, lleva la partida ronda a ronda y abre tus listas desde cualquier dispositivo.

> Proyecto personal y sin ánimo de lucro, hecho por fans. No está afiliado ni respaldado por Games Workshop. Warhammer 40.000 y todos sus nombres son marcas de sus respectivos propietarios.

---

## Funcionalidades

### Facciones
- Las **28 facciones** de 11.ª edición, con filtros por Imperio, Caos y Xenos.
- Cada facción tiene su color: al elegirla, toda la app usa ese color.
- Ficha de facción con sus **personajes y unidades**, agrupados por categoría y con sus puntos.

### Constructor de listas
- Unas **1.380 hojas de datos** con los puntos de la actualización del 2 de octubre de 2026 (tamaño mínimo de cada unidad).
- Límites de 500, 1000, 1500, 2000 o 3000 puntos, con barra de progreso.
- Avisos en vivo:
  - Te pasas del límite de puntos.
  - Hay más copias de las permitidas (máximo 1 por héroe épico, 6 por línea de batalla y transportes asignados, 3 por el resto).
  - Falta un personaje para Señor de la Guerra.
  - Hay unidades de otra facción.
- Unidades personalizadas con varios tamaños, perfil (M, T, SV, W, LD, OC) y notas.
- Listas que se pueden duplicar y renombrar, exportar a texto y copiar o importar en JSON.

### Modo batalla
- Rondas 1–5 y turnos de cada jugador.
- Fases de Mando, Movimiento, Disparo, Carga y Combate.
- Puntos de mando, que pueden sumarse solos en cada fase de Mando.
- Marcador de puntos de victoria primarios y secundarios por ronda.
- Heridas y unidades destruidas, con el total de puntos destruidos.
- Notas de partida.

### Cuentas y sincronización
- Registro e inicio de sesión con correo y contraseña (**Firebase Authentication**).
- Recuperación de contraseña por correo.
- Listas, unidades y partida en curso guardadas en **Cloud Firestore**, sincronizadas al momento entre dispositivos.
- Sin cuenta, la app funciona igual y guarda los datos en el propio navegador.
- Diagnóstico de conexión integrado en la pestaña **Cuenta**.

---

## Tecnología

| Parte | Herramienta |
|---|---|
| Interfaz | HTML, CSS y JavaScript sin frameworks, en un solo archivo |
| Tipografía | Chakra Petch, Rajdhani y Share Tech Mono (Google Fonts) |
| Cuentas | Firebase Authentication (correo y contraseña) |
| Base de datos | Cloud Firestore |
| Alojamiento | Firebase Hosting |

---

## Estructura

```
bastion-hosting/
├── public/
│   └── index.html      # La app completa
├── firebase.json       # Configuración de Hosting y Firestore
├── firestore.rules     # Reglas de seguridad
├── .firebaserc         # Proyecto de Firebase por defecto
└── README.md
```

---

## Puesta en marcha

### 1. Crear el proyecto en Firebase
1. Entra en [console.firebase.google.com](https://console.firebase.google.com) y crea un proyecto.
2. En **Authentication → Sign-in method**, activa **Correo electrónico/contraseña**.
3. En **Firestore Database**, crea la base de datos.

### 2. Instalar las herramientas (una sola vez)
Necesitas [Node.js](https://nodejs.org) (versión LTS).

```bash
npm install -g firebase-tools
firebase login
```

### 3. Elegir el proyecto
Desde la carpeta del proyecto:

```bash
firebase use TU-PROJECT-ID
```

### 4. Publicar

```bash
firebase deploy
```

Esto sube la app y las reglas de seguridad. Al terminar verás la **Hosting URL** (`https://TU-PROYECTO.web.app`).

> En Firebase Hosting la app lee sola la configuración del proyecto desde `/__/firebase/init.json`. No hace falta pegar el `firebaseConfig` en ningún sitio.

---

## Actualizar la app

1. Sustituye `public/index.html` por la versión nueva.
2. Publica solo la parte web:

```bash
firebase deploy --only hosting
```

Las cuentas y las listas de los usuarios están en Firestore, así que no se pierden al actualizar.

---

## Probar en local

Firebase necesita que la app se abra desde `http` o `https`: con doble clic sobre el archivo no se puede iniciar sesión. Para probar en tu ordenador:

```bash
firebase serve --only hosting
```

y abre `http://localhost:5000`.

---

## Seguridad

Cada usuario solo puede leer y escribir su propio documento (`users/{uid}`):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

El `firebaseConfig` de una app web no es secreto, pero si el repositorio es público conviene no incluirlo. En Firebase Hosting no hace falta, porque se carga solo.

---

## Pendiente

- [ ] Puntos de todos los tamaños de escuadra (ahora solo el mínimo).
- [ ] Mejoras y equipo con coste en puntos.
- [ ] Destacamentos y estratagemas.
- [ ] Compartir listas con otros jugadores.

---

## Licencia

Uso personal. Los datos de unidades y puntos pertenecen a Games Workshop.
