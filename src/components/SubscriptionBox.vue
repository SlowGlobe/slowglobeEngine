<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { usePermission } from '@vueuse/core'
import {
  requestNotificationPermission,
  subscribeToPushNotifications,
  testPushNotifications
} from '@/functions/pushNotifications'

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

function pushCheckIfSubscribed() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((subscription) => {
        if (subscription) {
          console.log('Already subscribed:', subscription)
          pushManagerIsSubscribed.value = true
        } else {
          console.log('Not subscribed')
          pushManagerIsSubscribed.value = false
        }
      })
    })
  } else {
    console.warn('Service workers are not supported in this browser.')
    pushManagerIsSubscribed.value = false
    pushUnsupportedBrowser.value = true
  }
}

const pushUnsupportedBrowser = ref(false)
const pushManagerIsSubscribed = ref(false)
const pushPermissionPushAllowed = usePermission('push')
const pushPermissionNotificationAllowed = usePermission('notifications')
pushCheckIfSubscribed()
const pushAllGood = computed(() => {
  return pushPermissionNotificationAllowed.value === 'granted' && pushManagerIsSubscribed.value
})

const pushErrorMessage = ref('')

function showError(message: string, type: 'push' | 'email' = 'push') {
  console.error(message)
  if (type === 'push') {
    pushErrorMessage.value = message
  }
}

async function pushUnsubscribe() {
  pushErrorMessage.value = '' // Reset error message
  if (!pushManagerIsSubscribed.value) {
    showError('You are not subscribed to push notifications.')
    return
  }

  // Unsubscribe from push notifications
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      await subscription.unsubscribe()
      pushManagerIsSubscribed.value = false
      console.log('Unsubscribed from push notifications.')
      pushCheckIfSubscribed()
    } else {
      showError('No active subscription found.')
    }
  } catch (error) {
    console.error('Failed to unsubscribe:', error)
    showError('Failed to unsubscribe from push notifications.')
  }
}

async function pushSubscribe() {
  pushErrorMessage.value = '' // Reset error message
  //Check if this browser supports service workers and push notifications
  if (pushUnsupportedBrowser.value) {
    showError(
      'Push notifications are not supported in this browser. Try another browser like Chrome or Firefox.'
    )
    return
  }

  //Check permissions
  await requestNotificationPermission()
  if (pushPermissionNotificationAllowed.value !== 'granted') {
    showError('Push notifications are not allowed. Please enable them in your browser settings.')
    return
  }

  // do the subscription on the server
  if (!pushManagerIsSubscribed.value) {
    const subscription = await subscribeToPushNotifications()
    if (subscription != null) {
      pushManagerIsSubscribed.value = true
    } else {
      showError('Failed to subscribe to push notification service.')
      return
    }
  } else {
    console.log('Already subscribed to push notifications.')
  }
  pushCheckIfSubscribed()
  testPushNotifications()
}
</script>

<template>
  <dialog ref="subDialog" class="outerDialog" closedby="any">
    <div class="subBox">
      <h1 class="title">Subscribe for Updates</h1>

      <button @click="pushSubscribe" class="roundBtn">
        <iconify-icon v-if="!pushAllGood" class="iconButtons" icon="mdi:bell" inline></iconify-icon>
        <iconify-icon v-else class="iconButtons" icon="mdi:bell-check" inline></iconify-icon>
      </button>
      <p v-if="pushAllGood">You're subscribed to web push notifications.</p>
      <button v-if="pushAllGood" @click="pushUnsubscribe" class="unsubBtn">Unsubscribe</button>
      <p v-else>Get notifications in your browser</p>
      <button v-if="pushAllGood" @click="testPushNotifications" class="unsubBtn">Test</button>
      <p v-if="pushErrorMessage.length" style="color: red">Error: {{ pushErrorMessage }}</p>

      <div class="dividingLine"></div>
      <p>{{ pushPermissionPushAllowed }} push</p>
      <p>{{ pushPermissionNotificationAllowed }} notif</p>
      <p>{{ pushManagerIsSubscribed }} pushManagerSubscribe</p>
      <p>{{ pushAllGood }} pushAllGood</p>
      <div class="dividingLine"></div>

      <!-- <input type="email" placeholder="myname@example.com" /> -->
      <button class="roundBtn">
        <iconify-icon class="iconButtons" icon="mdi:email" inline></iconify-icon>
      </button>
      <p>Get emails in your inbox (coming soon)</p>

      <button autofocus @click="closeDialog" class="unsubBtn closeBtn">Close</button>
    </div>
  </dialog>
  <slot :showDialog="showDialog">
    <iconify-icon
      v-if="pushAllGood"
      icon="mdi:bell"
      class="notifBell"
      inline
      @click="showDialog"
    ></iconify-icon>
  </slot>
</template>

<style scoped>
p {
  font-family: 'Public Sans', sans-serif;
}
.subBox {
  padding: 2rem;
  border-radius: 0.5em;
  background-color: var(--md-sys-color-surface);
}
.outerDialog {
  text-align: center;
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
  color: var(--tertiary);
  background-color: color-mix(in srgb, var(--tertiary) 20%, transparent);
}

button.roundBtn {
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

button.unsubBtn {
  padding: 0.5em 1em;
  border-radius: 0.5em;
  text-transform: uppercase;
  font-size: 0.8em;
  margin: 0.5em;
}
button.closeBtn {
  margin-top: 3em;
}

.notifBell {
  position: fixed;
  top: 16px;
  right: 10px;
  z-index: 0;
  font-size: 2.2em;
  color: var(--primary);
  opacity: 0.6;
  cursor: pointer;
  filter: drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.2));
  @media (width <= 900px) {
    z-index: 0;
    top: unset;
    right: unset;
    bottom: 10px;
    left: 10px;
  }
}
</style>
