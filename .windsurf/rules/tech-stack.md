---
trigger: always_on
---

**Coding guidlines**

1- this is vue with TS (type safe). use VueJs best practices. Use Pinia for store management. stores are responisble for API calls.
2- for UI comonents, alway use shadcn-vue. (already installed and configured)
3- if a shadCN component is not available under components/ui, install using : npx shadcn-vue@latest add {component name}
4- for Icons, always use lucide-vue. use like: import { Camera } from 'lucide-vue';
5- project is using tailwind 4 (already configured), there is no tailwind js for configuraion of tailwind4. use main css for tailwind configurations. (search web if unsure) (never add a tailwind config js file)
6- this project has a firebase back end. (already initialized). run firebase cli commands to deploy or any other tasks.