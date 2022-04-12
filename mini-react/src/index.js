
/**
 * 创建element
 * @param {*} type 
 * @param {*} props 
 * @param  {...any} children 
 */
function creatElement(type, props, ...children) {
  return {
    type, 
    props: {
      ...props,
      children: children.map((child) => (typeof child === 'object') ? child : createTextElement(child))
    }
  }
}

/**
 *  创建text类型
 * @param {*} text 
 */
function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}

/**
 * 创建dom
 * @param {*} fiber 
 * @returns 
 */
function creatDom(fiber) {
  const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(fiber.type)

  updateDom(dom, {}, fiber.props)
  return dom
}

const isEvent = (key) => (key + '').startsWith('on') // 事件
const isProperty = (key) => key !== 'children' && !isEvent(key)  // 属性
const isNew = (prev, next) => (key) => prev[key] !== next[key] // 新的元素
const isGone = (prev, next) => (key) => !(key in next) // 已删除的元素

/**
 * 更新节点属性
 * @param {*} dom 
 * @param {*} prevProps 
 * @param {*} nextProps 
 */
function updateDom(dom, prevProps, nextProps) {
  // 删除老的事件
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name])
    })


  // 删除旧属性
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = ''
    })

  // 设置新属性
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name]
    })
  
  // 添加新事件
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2)
      dom.addEventListener(eventType, nextProps[name])
    })

}