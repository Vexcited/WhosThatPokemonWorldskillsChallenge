import confetti from "https://esm.sh/canvas-confetti@1.6.0"

/**
 * Permet de générer un nombre aléatoire entre `min` et `max`.
 *
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
const random = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Permet d'attendre un certain nombre de millisecondes
 * avant de continuer l'exécution.
 *
 * @param {number} ms
 * @returns {Promise<void>}
 */
const wait = (ms => new Promise(resolve => setTimeout(resolve, ms)));

/**
 * Permet d'attendre une interaction de l'utilisateur.
 *
 * @returns {Promise<void>}
 */
const waitForUserInteraction = async () => {
  return new Promise((resolve) => {
    const handleClick = () => {
      resolve();
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleClick);
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleClick);
  });
}

const sayPokemonName = (name) => new Promise((resolve) => {
  const utterance = new SpeechSynthesisUtterance(`It's ${name}`);
  speechSynthesis.speak(utterance);

  utterance.onend = () => {
    resolve();
  }
});

const POKEMON_MIN_COUNT = 1;
const POKEMON_MAX_COUNT = 500;

const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${random(POKEMON_MIN_COUNT, POKEMON_MAX_COUNT)}/`);
const { sprites, cries, name: pokemonName } = await response.json();

// On précharge l'image.
const preloadedImage = new Image();
preloadedImage.src = sprites.other["official-artwork"].front_default;

// On précharge le cri du Pokémon.
const preloadedAudio = new Audio();
preloadedAudio.src = cries.latest; // Fichier .ogg !
preloadedAudio.volume = .45;

const audio = document.querySelector('#audio'); try {
  await audio.play();
} catch (error) {
  console.log('Autoplay was prevented. Waiting for user interaction...');
  await waitForUserInteraction();
  await audio.play();
}

document.querySelector("main").classList.remove('hidden');
document.querySelector("#restrictions").remove();

const POKEMON_CONTAINER = document.querySelector('.pokemon-container');
const MODAL = document.querySelector("#modal-1");

// On ajoute l'image sur la page HTML.
const image = document.createElement('img') ; {
  image.src = preloadedImage.src;
  image.classList.add('pokemon-image');
  image.setAttribute('width', '300');
  image.setAttribute('height', '300');

  // Permet d'éviter que l'on voit l'image sans l'ombre quand on la glisse.
  image.draggable = false;

  POKEMON_CONTAINER.appendChild(image);
};

// On créé la validation du formulaire en avance.
window.handleGuess = async (event) => {
  event.preventDefault();

  const value = document.querySelector('.guess-value').value
    .trim()
    .toLowerCase();

  // Si jamais on a pas de valeur, on ne fait rien.
  if (!value) return;

  if (value === pokemonName.toLowerCase()) {
    MODAL.classList.add('hidden');

    // On affiche l'image du Pokémon avec des confettis.
    image.style.filter = 'none';
    confetti(); // On attend pas la fin de l'animation.

    // On dit par TTS le nom du Pokémon.
    await wait(350);
    await sayPokemonName(pokemonName);

    // On joue le cri du Pokémon.
    await wait(350);
    preloadedAudio.play();
  }
  else {
    image.classList.add('shake');

    // On attend que l'animation soit terminée avant de la retirer.
    await wait(350);

    image.classList.remove('shake');
  }
};

// Au bout de 3 secondes, on affiche la modale.
await wait(3_000);
MODAL.classList.remove('hidden');
