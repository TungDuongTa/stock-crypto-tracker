declare global {
  type SignInFormData = {
    email: string;
    password: string;
  };

  type SignUpFormData = {
    fullName: string;
    email: string;
    password: string;
    country: string;
    investmentGoals: string;
    riskTolerance: string;
    preferredIndustry: string;
  };

  type CountrySelectProps = {
    name: string;
    label: string;
    control: Control;
    error?: FieldError;
    required?: boolean;
  };

  type FormInputProps = {
    name: string;
    label: string;
    placeholder: string;
    type?: string;
    register: UseFormRegister;
    error?: FieldError;
    validation?: RegisterOptions;
    disabled?: boolean;
    value?: string;
  };

  type Option = {
    value: string;
    label: string;
  };

  type SelectFieldProps = {
    name: string;
    label: string;
    placeholder: string;
    options: readonly Option[];
    control: Control;
    error?: FieldError;
    required?: boolean;
  };

  type FooterLinkProps = {
    text: string;
    linkText: string;
    href: string;
  };

  type SearchCommandProps = {
    renderAs?: "button" | "icon";
    label?: string;
    initialStocks: StockWithWatchlistStatus[];
  };
  type SearchCoinsCommandProps = {
    renderAs?: "button" | "icon";
    label?: string;
    initialCoins: CoinsWithWatchlistStatus[];
  };

  type WelcomeEmailData = {
    email: string;
    name: string;
    intro: string;
  };

  type User = {
    id: string;
    name: string;
    email: string;
    image?: string;
  };

  type Stock = {
    symbol: string;
    name: string;
    exchange: string;
    type: string;
  };

  type StockWithWatchlistStatus = Stock & {
    isInWatchlist: boolean;
  };
  type CoinsWithWatchlistStatus = SearchCoin & {
    isInWatchlist: boolean;
  };

  type FinnhubSearchResult = {
    symbol: string;
    description: string;
    displaySymbol?: string;
    type: string;
  };

  type FinnhubSearchResponse = {
    count: number;
    result: FinnhubSearchResult[];
  };

  type StockDetailsPageProps = {
    params: Promise<{
      symbol: string;
    }>;
  };

  type WatchlistButtonProps = {
    symbol: string;
    company: string;
    isInWatchlist?: boolean;
    showTrashIcon?: boolean;
    type?: "button" | "icon";
    onWatchlistChange?: (symbol: string, isAdded: boolean) => void;
  };

  type QuoteData = {
    c?: number;
    d?: number;
    dp?: number;
    h?: number;
    l?: number;
    o?: number;
    pc?: number;
    t?: number;
  };

  type CompanyProfileData = {
    country: string;
    currency: string;
    exchange: string;
    ipo: string; // ISO date string (YYYY-MM-DD)
    marketCapitalization: number;
    name: string;
    phone: string;
    shareOutstanding: number;
    ticker: string;
    weburl: string;
    logo: string;
    finnhubIndustry: string;
  };

  type FinancialsData = {
    metric?: { [key: string]: number };
  };

  type SelectedStock = {
    symbol: string;
    company: string;
    currentPrice?: number;
  };

  type WatchlistTableProps = {
    watchlist: StockWithData[];
  };

  type StockWithData = {
    userId?: string;
    symbol: string;
    logo?: string;
    company: string;
    addedAt?: Date;
    currentPrice?: number;
    changePercent?: number;
    priceFormatted?: string;
    changeFormatted?: string;
    marketCap?: string;
    peRatio?: string;
  };

  type AlertsListProps = {
    alertData: Alert[] | undefined;
  };

  type MarketNewsArticle = {
    id: number;
    headline: string;
    summary: string;
    source: string;
    url: string;
    datetime: number;
    category: string;
    related: string;
    image?: string;
  };

  type WatchlistNewsProps = {
    news?: MarketNewsArticle[];
  };

  type SearchCommandProps = {
    open?: boolean;
    setOpen?: (open: boolean) => void;
    renderAs?: "button" | "text";
    buttonLabel?: string;
    buttonVariant?: "primary" | "secondary";
    className?: string;
  };

  type AlertData = {
    symbol: string;
    company: string;
    alertName: string;
    alertType: "greater" | "less";
    threshold: string;
    logo?: string;
  };

  type AlertModalProps = {
    alertId?: string;
    alertData?: AlertData;
    action?: string;
    open: boolean;
    setOpen: (open: boolean) => void;
  };

  type RawNewsArticle = {
    id: number;
    headline?: string;
    summary?: string;
    source?: string;
    url?: string;
    datetime?: number;
    image?: string;
    category?: string;
    related?: string;
  };

  type Alert = {
    userId: string;
    symbol: string;
    company: string;
    alertName: string;
    currentPrice?: number;
    alertType: "greater" | "less";
    threshold: number;
    changePercent?: number;
    logo?: string;
  };
  type OHLCData = [number, number, number, number, number];

  interface NextPageProps {
    params: Promise<{ [key: string]: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }

  interface CandlestickChartProps {
    data?: OHLCData[];
    liveOhlcv?: OHLCData | null;
    coinId: string;
    height?: number;
    children?: React.ReactNode;
    mode?: "historical" | "live";
    initialPeriod?: Period;
    liveInterval: "1s" | "1m";
    setLiveInterval: (interval: "1s" | "1m") => void;
  }

  interface ConverterProps {
    symbol: string;
    icon: string;
    priceList: Record<string, number>;
  }

  interface Ticker {
    market: {
      name: string;
    };
    base: string;
    target: string;
    converted_last: {
      usd: number;
    };
    timestamp: string;
    trade_url: string;
  }

  type Period =
    | "daily"
    | "weekly"
    | "monthly"
    | "3months"
    | "6months"
    | "yearly"
    | "max";

  interface CoinMarketData {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    fully_diluted_valuation: number;
    total_volume: number;
    high_24h: number;
    low_24h: number;
    price_change_24h: number;
    price_change_percentage_24h: number;
    market_cap_change_24h: number;
    market_cap_change_percentage_24h: number;
    circulating_supply: number;
    total_supply: number;
    max_supply: number;
    ath: number;
    ath_change_percentage: number;
    ath_date: string;
    atl: number;
    atl_change_percentage: number;
    atl_date: string;
    last_updated: string;
  }

  interface TrendingCoin {
    item: {
      id: string;
      name: string;
      symbol: string;
      market_cap_rank: number;
      thumb: string;
      large: string;
      data: {
        price: number;
        price_change_percentage_24h: {
          usd: number;
        };
      };
    };
  }

  interface SearchCoin {
    id: string;
    name: string;
    symbol: string;
    market_cap_rank: number | null;
    thumb: string;
    large: string;
    data: {
      price?: number;
      price_change_percentage_24h: number;
    };
  }

  // Chart Section Props (used in ChartSection.tsx)
  interface ChartSectionProps {
    coinData: {
      image: { large: string };
      name: string;
      symbol: string;
      market_data: {
        current_price: { usd: number };
      };
    };
    coinOHLCData: OHLCData[];
    coinId: string;
  }

  interface TopGainersLosers {
    id: string;
    name: string;
    symbol: string;
    image: string;
    price: number;
    priceChangePercentage24h: number;
  }

  interface TopGainersLosersResponse {
    id: string;
    name: string;
    symbol: string;
    image: string;
    usd: number;
    usd_24h_change: number;
    usd_24h_vol: number;
    market_cap_rank: number;
  }

  interface PriceData {
    usd: number;
  }

  interface Trade {
    price?: number;
    timestamp?: number;
    type?: string;
    amount?: number;
    value?: number;
  }

  interface ExtendedPriceData {
    usd: number;
    coin?: string;
    price?: number;
    change24h?: number;
    marketCap?: number;
    volume24h?: number;
    timestamp?: number;
  }

  interface WebSocketMessage {
    type?: string;
    c?: string;
    ch?: string;
    i?: string;
    p?: number;
    pp?: number;
    pu?: number;
    m?: number;
    v?: number;
    vo?: number;
    o?: number;
    h?: number;
    l?: number;
    t?: number;
    to?: number;
    ty?: string;
    channel?: string;
    identifier?: string;
  }

  interface CoinDetailsData {
    id: string;
    name: string;
    symbol: string;
    asset_platform_id?: string | null;
    detail_platforms?: Record<
      string,
      {
        geckoterminal_url: string;
        contract_address: string;
      }
    >;
    image: {
      large: string;
      small: string;
    };
    market_data: {
      current_price: {
        usd: number;
        [key: string]: number;
      };
      price_change_24h_in_currency: {
        usd: number;
      };
      price_change_percentage_24h_in_currency: {
        usd: number;
      };
      price_change_percentage_30d_in_currency: {
        usd: number;
      };
      market_cap: {
        usd: number;
      };
      total_volume: {
        usd: number;
      };
    };
    market_cap_rank: number;
    description: {
      en: string;
    };
    links: {
      homepage: string[];
      blockchain_site: string[];
      subreddit_url: string;
    };
    tickers: Ticker[];
  }

  interface LiveDataProps {
    coinId: string;
    poolId: string;
    coin: CoinDetailsData;
    coinOHLCData?: OHLCData[];
    children?: React.ReactNode;
  }

  interface LiveCoinHeaderProps {
    name: string;
    image: string;
    livePrice?: number;
    livePriceChangePercentage24h: number;
    priceChangePercentage30d: number;
    priceChange24h: number;
  }

  interface Category {
    name: string;
    top_3_coins: string[];
    market_cap_change_24h: number;
    market_cap: number;
    volume_24h: number;
  }

  interface UseCoinGeckoWebSocketProps {
    coinId: string;
    poolId: string;
    liveInterval?: "1s" | "1m";
  }

  interface UseCoinGeckoWebSocketReturn {
    price: ExtendedPriceData | null;
    trades: Trade[];
    ohlcv: OHLCData | null;
    isConnected: boolean;
  }

  interface DataTableColumn<T> {
    header: React.ReactNode;
    cell: (row: T, index: number) => React.ReactNode;
    headClassName?: string;
    cellClassName?: string;
  }

  interface DataTableProps<T> {
    columns: DataTableColumn<T>[];
    data: T[];
    rowKey: (row: T, index: number) => React.Key;
    tableClassName?: string;
    headerClassName?: string;
    headerRowClassName?: string;
    headerCellClassName?: string;
    bodyRowClassName?: string;
    bodyCellClassName?: string;
  }

  type ButtonSize = "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";

  type PaginationLinkProps = {
    isActive?: boolean;
    size?: ButtonSize;
  } & React.ComponentProps<"a">;

  interface Pagination {
    currentPage: number;
    totalPages: number;
    hasMorePages: boolean;
  }

  interface HeaderProps {
    trendingCoins: TrendingCoin[];
  }

  type SearchItemCoin = SearchCoin | TrendingCoin["item"];

  interface SearchItemProps {
    coin: SearchItemCoin;
    onSelect: (coinId: string) => void;
    isActiveName: boolean;
  }

  interface CoinGeckoErrorBody {
    error?: string;
  }

  type QueryParams = Record<string, string | number | boolean | undefined>;

  interface PoolData {
    id: string;
    address: string;
    name: string;
    network: string;
  }
}

export {};
