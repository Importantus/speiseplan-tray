<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next';


</script>

<template>
    <div>
        <RefreshCw class="rotate" height="50px" />
    </div>
</template>

<style scoped>
div {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    opacity: 0.5;
}

@keyframes rotateAnimation {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.rotate {
    animation-name: rotateAnimation;
    animation-duration: 3s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    animation-play-state: running;
}
</style>