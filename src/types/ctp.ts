// CTP API 相关类型定义

export interface CtpAccountConfig {
  broker_id: string;
  account: string;
  password: string;
  trade_front: string;
  md_front: string;
  auth_code: string;
  user_product_info: string;
  app_id: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface MarketDataRequest {
  instrument_ids: string[];
}

export interface OrderRequest {
  instrument_id: string;
  direction: string; // "0" for buy, "1" for sell
  price: number;
  volume: number;
  order_type: string; // "1" for limit order
}

export interface MarketDataInfo {
  instrument_id: string;
  last_price: number;
  volume: number;
  turnover: number;
  open_interest: number;
  pre_close_price: number;
  pre_settlement_price: number;
  pre_open_interest: number;
  open_price: number;
  highest_price: number;
  lowest_price: number;
  upper_limit_price: number;
  lower_limit_price: number;
  settlement_price: number;
  currency_id: string;
  bid_price1: number;
  bid_volume1: number;
  ask_price1: number;
  ask_volume1: number;
  update_time: string;
  update_millisec: number;
  action_day: string;
}

export interface OrderInfo {
  order_ref: string;
  user_id: string;
  instrument_id: string;
  order_price_type: string;
  direction: string;
  combine_offset_flag: string;
  combine_hedge_flag: string;
  limit_price: number;
  volume_total_original: number;
  time_condition: string;
  gtd_date: string;
  volume_condition: string;
  min_volume: number;
  contingent_condition: string;
  stop_price: number;
  force_close_reason: string;
  is_auto_suspend: number;
  business_unit: string;
  request_id: number;
  order_local_id: string;
  exchange_id: string;
  participant_id: string;
  client_id: string;
  exchange_inst_id: string;
  trader_id: string;
  install_id: number;
  order_submit_status: string;
  notify_sequence: number;
  trading_day: string;
  settlement_id: number;
  order_sys_id: string;
  order_source: string;
  order_status: string;
  order_type: string;
  volume_traded: number;
  volume_total: number;
  insert_date: string;
  insert_time: string;
  active_time: string;
  suspend_time: string;
  update_time: string;
  cancel_time: string;
  active_trader_id: string;
  clearing_part_id: string;
  sequence_no: number;
  front_id: number;
  session_id: number;
  user_product_info: string;
  status_msg: string;
  user_force_close: number;
  active_user_id: string;
  broker_order_seq: number;
  relative_order_sys_id: string;
  zcetotal_traded_volume: number;
  is_swap_order: number;
  branch_id: string;
  invest_unit_id: string;
  account_id: string;
  currency_id: string;
  ip_address: string;
  mac_address: string;
}

export interface TradeInfo {
  broker_id: string;
  investor_id: string;
  instrument_id: string;
  order_ref: string;
  user_id: string;
  exchange_id: string;
  trade_id: string;
  direction: string;
  order_sys_id: string;
  participant_id: string;
  client_id: string;
  trading_role: string;
  exchange_inst_id: string;
  offset_flag: string;
  hedge_flag: string;
  price: number;
  volume: number;
  trade_date: string;
  trade_time: string;
  trade_type: string;
  price_source: string;
  trader_id: string;
  order_local_id: string;
  clearing_part_id: string;
  business_unit: string;
  sequence_no: number;
  trading_day: string;
  settlement_id: number;
  broker_order_seq: number;
  trade_source: string;
  invest_unit_id: string;
}

export interface InstrumentInfo {
  instrument_id: string;
  exchange_id: string;
  instrument_name: string;
  exchange_inst_id: string;
  product_id: string;
  product_class: string;
  delivery_year: number;
  delivery_month: number;
  max_market_order_volume: number;
  min_market_order_volume: number;
  max_limit_order_volume: number;
  min_limit_order_volume: number;
  volume_multiple: number;
  price_tick: number;
  create_date: string;
  open_date: string;
  expire_date: string;
  start_deliv_date: string;
  end_deliv_date: string;
  inst_life_phase: string;
  is_trading: number;
  position_type: string;
  position_date_type: string;
  long_margin_ratio: number;
  short_margin_ratio: number;
  max_margin_side_algorithm: string;
  underlying_inst_id: string;
  strike_price: number;
  options_type: string;
  underlying_multiple: number;
  combination_type: string;
}

export interface PositionInfo {
  instrument_id: string;
  broker_id: string;
  investor_id: string;
  posi_direction: string;
  hedge_flag: string;
  position_date: string;
  yd_position: number;
  position: number;
  long_frozen: number;
  short_frozen: number;
  long_frozen_amount: number;
  short_frozen_amount: number;
  open_volume: number;
  close_volume: number;
  open_amount: number;
  close_amount: number;
  position_cost: number;
  pre_margin: number;
  use_margin: number;
  frozen_margin: number;
  frozen_cash: number;
  frozen_commission: number;
  cash_in: number;
  commission: number;
  close_profit: number;
  position_profit: number;
  pre_settlement_price: number;
  settlement_price: number;
  trading_day: string;
  settlement_id: number;
  open_cost: number;
  exchange_margin: number;
  combine_position: number;
  combine_long_frozen: number;
  combine_short_frozen: number;
  close_profit_by_date: number;
  close_profit_by_trade: number;
  today_position: number;
  margin_rate_by_money: number;
  margin_rate_by_volume: number;
  strike_frozen: number;
  strike_frozen_amount: number;
  abandon_frozen: number;
  exchange_id: string;
  yd_strike_frozen: number;
  invest_unit_id: string;
  position_cost_offset: number;
}

export interface AccountInfo {
  broker_id: string;
  account_id: string;
  pre_mortgage: number;
  pre_credit: number;
  pre_deposit: number;
  pre_balance: number;
  pre_margin: number;
  interest_base: number;
  interest: number;
  deposit: number;
  withdraw: number;
  frozen_margin: number;
  frozen_cash: number;
  frozen_commission: number;
  curr_margin: number;
  cash_in: number;
  commission: number;
  close_profit: number;
  position_profit: number;
  balance: number;
  available: number;
  withdraw_quota: number;
  reserve: number;
  trading_day: string;
  settlement_id: number;
  credit: number;
  mortgage: number;
  exchange_margin: number;
  delivery_margin: number;
  exchange_delivery_margin: number;
  reserve_balance: number;
  currency_id: string;
  pre_fund_mortgage_in: number;
  pre_fund_mortgage_out: number;
  fund_mortgage_in: number;
  fund_mortgage_out: number;
  fund_mortgage_available: number;
  mortgage_able_fund: number;
  spec_product_margin: number;
  spec_product_frozen_margin: number;
  spec_product_commission: number;
  spec_product_frozen_commission: number;
  spec_product_position_profit: number;
  spec_product_close_profit: number;
  spec_product_position_profit_by_alg: number;
  spec_product_exchange_margin: number;
  biz_type: string;
  frozen_swap: number;
  remain_swap: number;
}

// CTP API 命令类型
export type CtpCommand = 
  | 'get_api_version'
  | 'create_md_api'
  | 'create_trader_api'
  | 'md_login'
  | 'trader_login'
  | 'subscribe_market_data'
  | 'unsubscribe_market_data'
  | 'insert_order'
  | 'cancel_order'
  | 'query_position'
  | 'query_account'
  | 'query_order'
  | 'query_trade';

// 事件类型
export interface CtpEvent {
  type: string;
  data: any;
  timestamp: number;
}

// 连接状态
export enum ConnectionStatus {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  LoginSuccess = 'login_success',
  LoginFailed = 'login_failed',
  Error = 'error'
}

// 日志级别
export enum LogLevel {
  Debug = 'debug',
  Info = 'info',
  Warning = 'warning',
  Error = 'error'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}
