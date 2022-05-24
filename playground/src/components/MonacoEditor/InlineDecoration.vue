<script setup lang="ts">
import type * as monaco from 'monaco-editor'
import { toRef, watch } from 'vue'
import { useInlineDecoration } from './useInlineDecoration'

interface Props {
  options: monaco.editor.IModelDeltaDecoration[]
}
const props = defineProps<Props>()

useInlineDecoration(toRef(props, 'options'))
</script>

