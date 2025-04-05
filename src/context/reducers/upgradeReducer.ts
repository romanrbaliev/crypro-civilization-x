
        miningParams: {
          ...state.miningParams,
          energyEfficiency: energyEfficiency * 1.1,
          volatility: (state.miningParams?.volatility || 0.05)
        }
