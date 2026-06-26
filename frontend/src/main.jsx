import React from 'react'
import ReactDOM from 'react-dom/client'

console.log('=== 测试：main.jsx 执行了 ===')

const rootElement = document.getElementById('root')
console.log('root 元素:', rootElement)

rootElement.innerHTML = '<div style="padding: 20px; font-size: 24px; color: red;">测试：如果看到这段文字，说明 React 入口是好的</div>'
