interface Env {
  DB: D1Database;
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    // 爬取大乐透
    const dltHtml = await fetch(
      "https://datachart.500.com/dlt/history/newinc/history.php?limit=1"
    ).then((r) => r.text());
    const dltMatch = dltHtml.match(
      /<tr[^>]*>.*?<td[^>]*>(\d+)<\/td>.*?<td[^>]*>([\d-]+)<\/td>.*?class="red"[^>]*>([\d\s]+)<\/td>.*?class="blue"[^>]*>([\d\s]+)<\/td>/s
    );
    if (dltMatch) {
      const [, period, date, frontStr, backStr] = dltMatch;
      await env.DB.prepare(
        `INSERT OR IGNORE INTO lottery_records (type, period, date, main_balls, special_balls) VALUES (?, ?, ?, ?, ?)`
      )
        .bind(
          "super_lotto",
          period,
          date,
          JSON.stringify(frontStr.trim().split(/\s+/).map(Number)),
          JSON.stringify(backStr.trim().split(/\s+/).map(Number))
        )
        .run();
    }

    // 爬取双色球
    const ssqHtml = await fetch(
      "https://datachart.500.com/ssq/history/newinc/history.php?limit=1"
    ).then((r) => r.text());
    const ssqMatch = ssqHtml.match(
      /<tr[^>]*>.*?<td[^>]*>(\d+)<\/td>.*?<td[^>]*>([\d-]+)<\/td>.*?class="red"[^>]*>([\d\s]+)<\/td>.*?class="blue"[^>]*>(\d+)<\/td>/s
    );
    if (ssqMatch) {
      const [, period, date, redStr, blue] = ssqMatch;
      await env.DB.prepare(
        `INSERT OR IGNORE INTO lottery_records (type, period, date, main_balls, special_balls) VALUES (?, ?, ?, ?, ?)`
      )
        .bind(
          "ssq",
          period,
          date,
          JSON.stringify(redStr.trim().split(/\s+/).map(Number)),
          JSON.stringify([parseInt(blue)])
        )
        .run();
    }
  },
};
