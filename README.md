# Tauri + Vue + TypeScript

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Type Support For `.vue` Imports in TS

Since TypeScript cannot handle type information for `.vue` imports, they are shimmed to be a generic Vue component type by default. In most cases this is fine if you don't really care about component prop types outside of templates. However, if you wish to get actual prop types in `.vue` imports (for example to get props validation when using manual `h(...)` calls), you can enable Volar's Take Over mode by following these steps:

1. Run `Extensions: Show Built-in Extensions` from VS Code's command palette, look for `TypeScript and JavaScript Language Features`, then right click and select `Disable (Workspace)`. By default, Take Over mode will enable itself if the default TypeScript extension is disabled.
2. Reload the VS Code window by running `Developer: Reload Window` from the command palette.

You can learn more about Take Over mode [here](https://github.com/johnsoncodehk/volar/discussions/471).

## FAQ

1. tauri 的权限配置现在是再 capabilities.json 中配置的，而不是在 tauri.conf.json 中配置的。
2. 运行时，如果出现`Error: failed to spawn: The system cannot find the file specified.`，请检查 tauri.conf.json 中的 tauri.bundle.active 的值是否为 true。
3.

## capabilities.json

有效值:
"core:default", // 默认权限
"core:app:default", // 应用权限
"core:app:allow-app-hide", // 隐藏应用
"core:app:allow-app-show", // 显示应用
"core:app:allow-default-window-icon", // 获取默认图标
"core:app:allow-fetch-data-store-identifiers", // 获取数据存储标识符
"core:app:allow-identifier", // 获取应用标识符
"core:app:allow-name", // 获取应用名称
"core:app:allow-remove-data-store", // 删除数据存储
"core:app:allow-set-app-theme", // 设置应用主题
"core:app:allow-set-dock-visibility", // 设置应用图标
"core:app:allow-tauri-version", // 获取 Tauri 版本
"core:app:allow-version", // 获取版本
"core:app:deny-app-hide", // 取消隐藏应用
"core:app:deny-app-show", // 取消显示应用
"core:app:deny-default-window-icon", // 取消获取默认图标
"core:app:deny-fetch-data-store-identifiers", // 取消获取数据存储标识符
"core:app:deny-identifier", // 取消获取应用标识符
"core:app:deny-name", // 取消获取应用名称
"core:app:deny-remove-data-store", // 取消删除数据存储
"core:app:deny-set-app-theme", // 取消设置应用主题
"core:app:deny-set-dock-visibility", // 取消设置应用图标
"core:app:deny-tauri-version", // 取消获取 Tauri 版本
"core:app:deny-version", // 取消获取版本
"core:event:default", // 事件
"core:event:allow-emit", // 发送事件
"core:event:allow-emit-to", // 发送事件
"core:event:allow-listen", // 监听事件
"core:event:allow-unlisten", // 取消监听事件
"core:event:deny-emit", // 取消发送事件
"core:event:deny-emit-to", // 取消发送事件
"core:event:deny-listen", // 取消监听事件
"core:event:deny-unlisten", // 取消取消监听事件
"core:image:default", // 图片
"core:image:allow-from-bytes", // 从字节创建图片
"core:image:allow-from-path", // 从路径创建图片
"core:image:allow-new", // 创建图片
"core:image:allow-rgba", // 创建图片
"core:image:allow-size", // 获取图片大小
"core:image:deny-from-bytes", // 取消从字节创建图片
"core:image:deny-from-path", // 取消从路径创建图片
"core:image:deny-new", // 取消创建图片
"core:image:deny-rgba", // 取消创建图片
"core:image:deny-size", // 取消获取图片大小
"core:menu:default", // 菜单
"core:menu:allow-append", // 添加菜单项
"core:menu:allow-create-default", // 创建默认菜单
"core:menu:allow-get", // 获取菜单项
"core:menu:allow-insert", // 插入菜单项
"core:menu:allow-is-checked", // 获取菜单项是否被选中
"core:menu:allow-is-enabled", // 获取菜单项是否可用
"core:menu:allow-items", // 获取菜单项
"core:menu:allow-new", // 创建菜单
"core:menu:allow-popup", // 弹出菜单
"core:menu:allow-prepend", // 插入菜单项
"core:menu:allow-remove",
"core:menu:allow-remove-at",
"core:menu:allow-set-accelerator",
"core:menu:allow-set-as-app-menu",
"core:menu:allow-set-as-help-menu-for-nsapp",
"core:menu:allow-set-as-window-menu",
"core:menu:allow-set-as-windows-menu-for-nsapp",
"core:menu:allow-set-checked",
"core:menu:allow-set-enabled",
"core:menu:allow-set-icon",
"core:menu:allow-set-text",
"core:menu:allow-text",
"core:menu:deny-append",
"core:menu:deny-create-default",
"core:menu:deny-get",
"core:menu:deny-insert",
"core:menu:deny-is-checked",
"core:menu:deny-is-enabled",
"core:menu:deny-items",
"core:menu:deny-new",
"core:menu:deny-popup",
"core:menu:deny-prepend",
"core:menu:deny-remove",
"core:menu:deny-remove-at",
"core:menu:deny-set-accelerator",
"core:menu:deny-set-as-app-menu",
"core:menu:deny-set-as-help-menu-for-nsapp",
"core:menu:deny-set-as-window-menu",
"core:menu:deny-set-as-windows-menu-for-nsapp",
"core:menu:deny-set-checked",
"core:menu:deny-set-enabled",
"core:menu:deny-set-icon",
"core:menu:deny-set-text",
"core:menu:deny-text",
"core:path:default",
"core:path:allow-basename",
"core:path:allow-dirname",
"core:path:allow-extname",
"core:path:allow-is-absolute",
"core:path:allow-join",
"core:path:allow-normalize",
"core:path:allow-resolve",
"core:path:allow-resolve-directory",
"core:path:deny-basename",
"core:path:deny-dirname",
"core:path:deny-extname",
"core:path:deny-is-absolute",
"core:path:deny-join",
"core:path:deny-normalize",
"core:path:deny-resolve",
"core:path:deny-resolve-directory",
"core:resources:default",
"core:resources:allow-close",
"core:resources:deny-close",
"core:tray:default",
"core:tray:allow-get-by-id",
"core:tray:allow-new",
"core:tray:allow-remove-by-id",
"core:tray:allow-set-icon",
"core:tray:allow-set-icon-as-template",
"core:tray:allow-set-menu",
"core:tray:allow-set-show-menu-on-left-click",
"core:tray:allow-set-temp-dir-path",
"core:tray:allow-set-title",
"core:tray:allow-set-tooltip",
"core:tray:allow-set-visible",
"core:tray:deny-get-by-id",
"core:tray:deny-new",
"core:tray:deny-remove-by-id",
"core:tray:deny-set-icon",
"core:tray:deny-set-icon-as-template",
"core:tray:deny-set-menu",
"core:tray:deny-set-show-menu-on-left-click",
"core:tray:deny-set-temp-dir-path",
"core:tray:deny-set-title",
"core:tray:deny-set-tooltip",
"core:tray:deny-set-visible",
"core:webview:default",
"core:webview:allow-clear-all-browsing-data", // 清除所有浏览数据
"core:webview:allow-create-webview", // 创建 Webview
"core:webview:allow-create-webview-window", // 创建 Webview 窗口
"core:webview:allow-get-all-webviews", // 获取所有 Webview
"core:webview:allow-internal-toggle-devtools", // 内部切换开发工具
"core:webview:allow-print", // 打印
"core:webview:allow-reparent", // 重新设置 Webview 父级
"core:webview:allow-set-webview-auto-resize", // 设置 Webview 自动调整大小
"core:webview:allow-set-webview-background-color", // 设置 Webview 背景颜色
"core:webview:allow-set-webview-focus", // 设置 Webview 获取焦点
"core:webview:allow-set-webview-position", // 设置 Webview 位置
"core:webview:allow-set-webview-size", // 设置 Webview 大小
"core:webview:allow-set-webview-zoom", // 设置 Webview 缩放
"core:webview:allow-webview-close", // 关闭 Webview
"core:webview:allow-webview-hide", // 隐藏 Webview
"core:webview:allow-webview-position", // 获取 Webview 位置
"core:webview:allow-webview-show", // 显示 Webview
"core:webview:allow-webview-size", // 获取 Webview 大小
"core:webview:deny-clear-all-browsing-data",
"core:webview:deny-create-webview",
"core:webview:deny-create-webview-window",
"core:webview:deny-get-all-webviews",
"core:webview:deny-internal-toggle-devtools",
"core:webview:deny-print",
"core:webview:deny-reparent",
"core:webview:deny-set-webview-auto-resize",
"core:webview:deny-set-webview-background-color",
"core:webview:deny-set-webview-focus",
"core:webview:deny-set-webview-position",
"core:webview:deny-set-webview-size",
"core:webview:deny-set-webview-zoom",
"core:webview:deny-webview-close",
"core:webview:deny-webview-hide",
"core:webview:deny-webview-position",
"core:webview:deny-webview-show",
"core:webview:deny-webview-size",
"core:window:default",
"core:window:allow-available-monitors",
"core:window:allow-center",
"core:window:allow-close",
"core:window:allow-create",
"core:window:allow-current-monitor",
"core:window:allow-cursor-position",
"core:window:allow-destroy",
"core:window:allow-get-all-windows",
"core:window:allow-hide",
"core:window:allow-inner-position",
"core:window:allow-inner-size",
"core:window:allow-internal-toggle-maximize",
"core:window:allow-is-always-on-top",
"core:window:allow-is-closable",
"core:window:allow-is-decorated",
"core:window:allow-is-enabled",
"core:window:allow-is-focused",
"core:window:allow-is-fullscreen",
"core:window:allow-is-maximizable",
"core:window:allow-is-maximized",
"core:window:allow-is-minimizable",
"core:window:allow-is-minimized",
"core:window:allow-is-resizable",
"core:window:allow-is-visible",
"core:window:allow-maximize",
"core:window:allow-minimize",
"core:window:allow-monitor-from-point",
"core:window:allow-outer-position",
"core:window:allow-outer-size",
"core:window:allow-primary-monitor",
"core:window:allow-request-user-attention",
"core:window:allow-scale-factor",
"core:window:allow-set-always-on-bottom",
"core:window:allow-set-always-on-top",
"core:window:allow-set-background-color",
"core:window:allow-set-badge-count",
"core:window:allow-set-badge-label",
"core:window:allow-set-closable",
"core:window:allow-set-content-protected",
"core:window:allow-set-cursor-grab",
"core:window:allow-set-cursor-icon",
"core:window:allow-set-cursor-position",
"core:window:allow-set-cursor-visible",
"core:window:allow-set-decorations",
"core:window:allow-set-effects",
"core:window:allow-set-enabled",
"core:window:allow-set-focus",
"core:window:allow-set-fullscreen",
"core:window:allow-set-icon",
"core:window:allow-set-ignore-cursor-events",
"core:window:allow-set-max-size",
"core:window:allow-set-maximizable",
"core:window:allow-set-min-size",
"core:window:allow-set-minimizable",
"core:window:allow-set-overlay-icon",
"core:window:allow-set-position",
"core:window:allow-set-progress-bar",
"core:window:allow-set-resizable",
"core:window:allow-set-shadow",
"core:window:allow-set-size",
"core:window:allow-set-size-constraints",
"core:window:allow-set-skip-taskbar",
"core:window:allow-set-theme",
"core:window:allow-set-title",
"core:window:allow-set-title-bar-style",
"core:window:allow-set-visible-on-all-workspaces",
"core:window:allow-show",
"core:window:allow-start-dragging",
"core:window:allow-start-resize-dragging",
"core:window:allow-theme",
"core:window:allow-title",
"core:window:allow-toggle-maximize",
"core:window:allow-unmaximize",
"core:window:allow-unminimize",
"core:window:deny-available-monitors",
"core:window:deny-center",
"core:window:deny-close",
"core:window:deny-create",
"core:window:deny-current-monitor",
"core:window:deny-cursor-position",
"core:window:deny-destroy",
"core:window:deny-get-all-windows",
"core:window:deny-hide",
"core:window:deny-inner-position",
"core:window:deny-inner-size",
"core:window:deny-internal-toggle-maximize",
"core:window:deny-is-always-on-top",
"core:window:deny-is-closable",
"core:window:deny-is-decorated",
"core:window:deny-is-enabled",
"core:window:deny-is-focused",
"core:window:deny-is-fullscreen",
"core:window:deny-is-maximizable",
"core:window:deny-is-maximized",
"core:window:deny-is-minimizable",
"core:window:deny-is-minimized",
"core:window:deny-is-resizable",
"core:window:deny-is-visible",
"core:window:deny-maximize",
"core:window:deny-minimize",
"core:window:deny-monitor-from-point",
"core:window:deny-outer-position",
"core:window:deny-outer-size",
"core:window:deny-primary-monitor",
"core:window:deny-request-user-attention",
"core:window:deny-scale-factor",
"core:window:deny-set-always-on-bottom",
"core:window:deny-set-always-on-top",
"core:window:deny-set-background-color",
"core:window:deny-set-badge-count",
"core:window:deny-set-badge-label",
"core:window:deny-set-closable",
"core:window:deny-set-content-protected",
"core:window:deny-set-cursor-grab",
"core:window:deny-set-cursor-icon",
"core:window:deny-set-cursor-position",
"core:window:deny-set-cursor-visible",
"core:window:deny-set-decorations",
"core:window:deny-set-effects",
"core:window:deny-set-enabled",
"core:window:deny-set-focus",
"core:window:deny-set-fullscreen",
"core:window:deny-set-icon",
"core:window:deny-set-ignore-cursor-events",
"core:window:deny-set-max-size",
"core:window:deny-set-maximizable",
"core:window:deny-set-min-size",
"core:window:deny-set-minimizable",
"core:window:deny-set-overlay-icon",
"core:window:deny-set-position",
"core:window:deny-set-progress-bar",
"core:window:deny-set-resizable",
"core:window:deny-set-shadow",
"core:window:deny-set-size",
"core:window:deny-set-size-constraints",
"core:window:deny-set-skip-taskbar",
"core:window:deny-set-theme",
"core:window:deny-set-title",
"core:window:deny-set-title-bar-style",
"core:window:deny-set-visible-on-all-workspaces",
"core:window:deny-show",
"core:window:deny-start-dragging",
"core:window:deny-start-resize-dragging",
"core:window:deny-theme",
"core:window:deny-title",
"core:window:deny-toggle-maximize",
"core:window:deny-unmaximize",
"core:window:deny-unminimize",
"opener:default",
"opener:allow-default-urls",
"opener:allow-open-path",
"opener:allow-open-url",
"opener:allow-reveal-item-in-dir",
"opener:deny-open-path",
"opener:deny-open-url",
"opener:deny-reveal-item-in-dir"
