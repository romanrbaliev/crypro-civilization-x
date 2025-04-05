
      dispatch({
        type: "UPDATE_REFERRAL_STATUS",
        payload: {
          referralId,
          status: "active",
          activated: true,
          hired: false,
          buildingId: null
        }
      });
