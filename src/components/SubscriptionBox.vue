<script setup lang="ts">
import { useTemplateRef } from 'vue'
import PostageStamp from './PostageStamp.vue'

defineProps<{
  headerImage: string
}>()

const dialog = useTemplateRef('subDialog')
function showDialog() {
  if (dialog.value) {
    dialog.value.showModal()
  }
}
function closeDialog() {
  if (dialog.value) {
    dialog.value.close()
  }
}
</script>

<template>
  <dialog ref="subDialog" class="outerDialog" closedby="any">
    <div class="subBox">
      <h1 class="title">Subscribe for Updates</h1>
      <button>
        <iconify-icon class="iconButtons" icon="mdi:bell" inline></iconify-icon>
      </button>
      <p>Get notifications in your browser</p>
      <div class="dividingLine"></div>
      <!-- <input type="email" placeholder="myname@example.com" /> -->
      <button>
        <iconify-icon class="iconButtons" icon="mdi:email" inline></iconify-icon>
      </button>
      <p>Get emails in your inbox (coming soon)</p>
      <!-- <button autofocus @click="closeDialog">
        <iconify-icon class="iconButtons" icon="mdi:close" inline></iconify-icon>
      </button> -->
    </div>
  </dialog>
  <br />
  <br />
  <div class="center">
    <div class="signOffCont">
      <button class="stampImage" @click="showDialog">
        <img class="stampImage" src="/images/subscribeStampWithWaves.svg" />
      </button>
      <!-- <img class="stampImage" src="/images/subscribeStampWithWaves.svg" /> -->
      <PostageStamp :image="headerImage" style="left: 0.75em"></PostageStamp>
    </div>
  </div>
  <br />
</template>

<style scoped>
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
.signOffCont {
  rotate: -2deg;
  padding: 1.5em;
}
.stampImage {
  height: calc(5.5rem + 8px);
  width: calc(5.5rem + 8px);
  object-fit: cover;
  object-position: left;
  overflow: visible;
  position: relative;
  right: 0.75em;
  z-index: 2;
  border: none;
  background-color: transparent;
  cursor: pointer;
}

.stampImage:hover {
  background-color: transparent;
  scale: 1.05;
  transition: scale 0.15s linear;
}

p {
  font-family: 'Public Sans', sans-serif;
}
.subBox {
  padding: 2rem;
  border-radius: 0.5em;
  background-color: var(--md-sys-color-surface);
}
.outerDialog {
  border: none;
  background: none;
  padding: 0px;
  padding-top: 0.6em;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}
.subBox::before {
  content: ' ';
  position: absolute;
  top: 0em;
  width: 30%;
  height: 1em;
  border-radius: 0px;
  translate: -50% 5%;
  rotate: -1deg;
  background-color: rgba(165, 61, 61, 0.678);
}

.outerDialog::backdrop {
  backdrop-filter: saturate(80%) sepia(30%) blur(2px);
}

.dividingLine {
  width: 100%;
  height: 2px;
  background-color: var(--tertiary);
  opacity: 0.3;
  margin: 2em 0;
}

.title {
  font-size: 2em;
  margin-bottom: 1em;
}

.iconButtons {
  font-size: 2.5rem;
  padding: 0.3em;
  display: inline-block;
}

.subBox button {
  display: inline-block;
  border: none;
  margin: 0;
  text-decoration: none;
  background: #0069ed;
  color: #ffffff;
  font-family: sans-serif;
  font-size: 1rem;
  cursor: pointer;
  text-align: center;
  transition:
    background 250ms ease-in-out,
    transform 150ms ease;
  -webkit-appearance: none;
  -moz-appearance: none;

  color: var(--tertiary);
  background-color: color-mix(in srgb, var(--tertiary) 20%, transparent);
  aspect-ratio: 1/1;
  border-radius: 50%;
}

button:hover,
button:focus {
  background-color: color-mix(in srgb, var(--tertiary) 10%, transparent);
}

button:focus {
  outline: 1px solid #fff;
  outline-offset: -4px;
}

button:active {
  transform: scale(0.99);
}
</style>
