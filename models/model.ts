// film_plists
{
  _id,
  film_id,
  site,
  uri,
  created_at,
  status: 0/1,
}

// film_plist_episodes
{
  _id: site + id,
    created_at,
    film_plist_id,
    crawled_at,
    crawl_status
}

// film_plist_episode_playcounts
{
  _id: film_plist_episode_id + date,
    film_plist_episode_id,
    date: Date   // 0点
    value,
    is_real
  created_at: // 创建时间
}

// c_film_plist_playcounts
{
  _id: film_plist_id + date,
    film_plist_id,
    date,
    value
  calculated_at
}