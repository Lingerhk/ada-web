<template>
    <el-tooltip class="box-item" effect="dark" :content="getLevelAlt()" placement="top">
        <img :src="getLevelImg()" :alt="getLevelAlt()">
    </el-tooltip>
</template>

<script setup lang="ts">
import { transLevel } from '/@/utils/translator';

const props = defineProps({
    level: {
        type: Number,
        default: 5,
    },
});

const getLevelImg = () => {
    return {
        2: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAALCAYAAAATD/9GAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAcElEQVQ4je3UsQmAMBSE4buQHcxUgoUzJCP5VrBzKrOEnJVgEYWAkBT+7b3iqx6HeRuJw0gGFNrXiQBgZirtVzHGT+4kZedc9G+oFpEMksz3hLoVfGvBUz+sth9WW78wSbnDl5G9hARqIfrAScoA0gkzPScpNcxzJgAAAABJRU5ErkJggg==',
        3: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAALCAYAAAATD/9GAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAd0lEQVQ4je3UsRGAIBBE0T0ksQPaoAI7sA0oySuHCmyDDjRiTR1HmSGSgJ/eBi86OZNfC6EicHhpXnYBgCN5vt2fO1Wt7kII1R3JbIwJtob6IxFxJNX2hLrl7N+CrwastQFrrV8Yidzhy8h2MoyFsgF94EhmAPEClwooKLj/nxkAAAAASUVORK5CYII=',
        4: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAALCAYAAAATD/9GAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAbUlEQVQ4je3UMRGAMBBE0X+ZiIgCcIMN0ICAaOCsoSAqWFqKwAw0ScFvb4tXnSmPE8iBRCVbdwNQHlS7f925e3UnqYQQ5viEapGZJUke6Qh1KcXWgrt+2Nt+2Nu6hhX6exklcthC0EYnOEkFWE74uiMkH4RN4QAAAABJRU5ErkJggg==',
        5: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAALCAYAAAATD/9GAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAJqADAAQAAAABAAAACwAAAAC9o8vuAAAAa0lEQVQ4EWM8ribv+Z/h/6z/DAwyDFiA9a1HjCDho2pyQCW4AbXUAS17wsjAmMaCz1G4nUE7GUgA/Z/FhCukaGc1YZNBbmIirGxgVIw6jNRwHw2x4RNioAKNVN/QWj3ITUygUnYwOQ5W8gMAmNofbiccTEUAAAAASUVORK5CYII=',
    }[props.level] ?? '';
};

const getLevelAlt = () => {
    return transLevel(props.level);
};

</script>