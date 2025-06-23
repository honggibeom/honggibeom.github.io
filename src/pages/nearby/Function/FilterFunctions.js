const filtering = (filter, data) => {
  let close = {};
  for (const e of data.event_close_list) {
    close[e.date.split("T")[0]] = e;
  }

  let open = {};
  for (const e of data.event_open_list) {
    open[e.day] = e;
  }

  const category = displayCategory(filter.category, data.category);
  const fee = displayFee(filter.fee, data.charge);
  const run = displayRun(
    filter.run,
    data.start_date,
    data.end_date,
    isOpen(open, close)
  );
  const duration = displayDuration(
    filter.startDate,
    filter.endDate,
    data.start_date,
    data.end_date
  );

  const end = displayEnd(data.end_date);
  if (!end) return false;
  else return category && fee && run && duration;
};

const displayCategory = (categoryFilter, category) => {
  let flag = categoryFilter[category];
  let all = !(
    categoryFilter["전시회"] ||
    categoryFilter["공연"] ||
    categoryFilter["축제"] ||
    categoryFilter["원데이 클래스"]
  );
  if (all) return true;
  else return flag;
};

const displayFee = (feeFilter, fee) => {
  if (!(feeFilter["무료"] || feeFilter["부분유료"] || feeFilter["유료"]))
    return true;
  else if (fee === 0 && feeFilter["무료"]) return true;
  else if (fee === 1 && feeFilter["유료"]) return true;
  else if (fee === 2 && feeFilter["부분유료"]) return true;
  return false;
};

const displayRun = (runFilter, startDate, endDate, isOpen) => {
  if (
    !(runFilter["곧 오픈"] || runFilter["현재 운영중"] || runFilter["곧 종료"])
  )
    return true;
  else {
    let run = {
      "곧 오픈": false,
      "현재 운영중": false,
      "곧 종료": false,
    };

    let now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);

    let after7 = new Date();
    after7.setDate(after7.getDate() + 7);

    let start = new Date(startDate);
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    start.setMilliseconds(0);

    if (now - start <= 0 && after7 - start >= 0) {
      run["곧 오픈"] = true;
    }

    if (endDate === null && now - start >= 0 && isOpen) {
      run["현재 운영중"] = true;
    } else if (endDate !== null && now - start >= 0) {
      let end = new Date(endDate);
      end.setHours(0);
      end.setMinutes(0);
      end.setSeconds(0);
      end.setMilliseconds(0);

      if (end - now >= 0) {
        if (isOpen) run["현재 운영중"] = true;
        if (after7 - end >= 0) {
          run["곧 종료"] = true;
        }
      }
    }

    return (
      (run["곧 오픈"] && runFilter["곧 오픈"]) ||
      (run["현재 운영중"] && runFilter["현재 운영중"]) ||
      (run["곧 종료"] && runFilter["곧 종료"])
    );
  }
};

const displayDuration = (
  filterStartDate,
  filterEndDate,
  startDate,
  endDate
) => {
  if (filterStartDate === null || filterEndDate === null) return true;
  else {
    if (startDate === null) return false;
    else {
      let start = new Date(startDate);
      filterStartDate.setHours(0);
      filterStartDate.setMinutes(0);
      filterStartDate.setSeconds(0);
      filterStartDate.setMilliseconds(0);
      filterEndDate.setHours(0);
      filterEndDate.setMinutes(0);
      filterEndDate.setSeconds(0);
      filterEndDate.setMilliseconds(0);
      start.setHours(0);
      start.setMinutes(0);
      start.setSeconds(0);
      start.setMilliseconds(0);

      if (endDate === null) {
        if (start - filterEndDate > 0) return false;
        else return true;
      } else {
        let end = new Date(endDate);
        end.setHours(0);
        end.setMinutes(0);
        end.setSeconds(0);
        end.setMilliseconds(0);

        if (start - filterEndDate > 0 || filterStartDate - end > 0)
          return false;
        else return true;
      }
    }
  }
};

const displayEnd = (endDate) => {
  if (endDate === null) return true;
  else {
    let now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    let end = new Date(endDate);
    end.setDate(end.getDate() + 3);
    end.setHours(0);
    end.setMinutes(0);
    end.setSeconds(0);
    end.setMilliseconds(0);

    if (now - end > 0) return false;
    else return true;
  }
};

const isOpen = (open, close) => {
  let now = new Date();
  const day = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const key = close[now.toISOString().split("T")[0]];
  let n = now.getHours() * 100 + now.getMinutes();
  if (open[day] === undefined || open[day] === true) return false;

  if (close[key] !== null && close[key] !== undefined) {
    if (close[key].type) {
      const start = close[key].start_at.split(":");
      const end = close[key].start_at.split(":");

      let s = Number(start[0]) * 100 + Number(start[1]);
      let e = Number(end[0]) * 100 + Number(end[1]);
      if (s <= n && e >= n) return true;
    }
    return false;
  }
  const start = open[day].start_at.split(":");
  const end = open[day].close_at.split(":");
  let s = Number(start[0]) * 100 + Number(start[1]);
  let e = Number(end[0]) * 100 + Number(end[1]);
  if (s <= n && e >= n) return true;
  return false;
};

export default filtering;
