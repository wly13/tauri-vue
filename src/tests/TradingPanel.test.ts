import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TradingPanel from '../views/TradingPanel.vue'

describe('TradingPanel', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(TradingPanel)
  })

  it('renders properly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays contract name', () => {
    expect(wrapper.text()).toContain('rb2509')
  })

  it('has five column headers', () => {
    const headers = wrapper.findAll('.col-header')
    expect(headers).toHaveLength(5)
    expect(headers[0].text()).toBe('撤单')
    expect(headers[1].text()).toBe('买单')
    expect(headers[2].text()).toBe('价位')
    expect(headers[3].text()).toBe('卖单')
    expect(headers[4].text()).toBe('')
  })

  it('displays current price', () => {
    expect(wrapper.find('.current-price-display').text()).toBe('3070')
  })

  it('has order input fields', () => {
    const inputs = wrapper.findAll('.order-input')
    expect(inputs).toHaveLength(2)
  })

  it('has order type radio buttons', () => {
    const radioButtons = wrapper.findAll('input[type="radio"]')
    expect(radioButtons.length).toBeGreaterThan(0)
  })

  it('displays sell orders', () => {
    const sellRows = wrapper.findAll('.sell-row')
    expect(sellRows.length).toBeGreaterThan(0)
  })

  it('displays buy orders', () => {
    const buyRows = wrapper.findAll('.buy-row')
    expect(buyRows.length).toBeGreaterThan(0)
  })

  it('has zoom controls', () => {
    const zoomButtons = wrapper.findAll('.zoom-btn')
    expect(zoomButtons).toHaveLength(2)
    expect(zoomButtons[0].text()).toBe('+')
    expect(zoomButtons[1].text()).toBe('-')
  })

  it('displays operation help', () => {
    expect(wrapper.text()).toContain('操作说明')
    expect(wrapper.text()).toContain('第1列：点击快速撤单')
  })

  it('has clickable cancel buttons', () => {
    const cancelCols = wrapper.findAll('.cancel-col')
    expect(cancelCols.length).toBeGreaterThan(0)
    cancelCols.forEach((col: any) => {
      expect(col.text()).toBe('×')
    })
  })

  it('handles zoom in functionality', async () => {
    const zoomInBtn = wrapper.find('.zoom-btn')
    const initialFontSize = wrapper.vm.fontSize
    
    await zoomInBtn.trigger('click')
    
    expect(wrapper.vm.fontSize).toBe(initialFontSize + 1)
  })

  it('handles order type selection', async () => {
    const orderTypeA = wrapper.find('input[value="A"]')
    const orderTypeB = wrapper.find('input[value="B"]')
    
    await orderTypeA.setChecked(true)
    expect(wrapper.vm.orderType).toBe('A')
    
    await orderTypeB.setChecked(true)
    expect(wrapper.vm.orderType).toBe('B')
  })
})
