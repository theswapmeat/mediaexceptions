import React, { useState } from "react";
import { useQuery } from "react-query";
import supabase from "../utils/supabase";
import { groupByKey } from "../utils/helpers";
import { useAuth } from "../contexts/Auth";

const fetchFixtures = async (key, page) => {
  const res = await supabase
    .from("matches")
    .select("*, hometeamname:hometeamid(name), awayteamname:awayteamid(name)")
    .order("id", { ascending: true })
    .order("matchdate", { ascending: true });
  return res.data;
};

const MakePicks = () => {
  const [hometeamscore, setHometeamscore] = useState(null);
  const [awayteamscore, setAwayteamscore] = useState(null);
  const { user } = useAuth();
  var picks = [];
  var groupedFixtures = [];
  const { data, status } = useQuery(["matches"], fetchFixtures);

  if (status === "success") {
    data.map((data) =>
      picks.push({
        id: data.id,
        hometeamscore: null,
        awayteamscore: null,
        userid: user.id,
      })
    );

    var fixtures = groupByKey(data, "matchdate", { omitKey: true });

    for (const [date, matches] of Object.entries(fixtures)) {
      groupedFixtures.push({ date, matches });
    }
  }

  const handleUpdatePick = (id, homescore, awayscore) => {
    const objIndex = picks.findIndex((obj) => obj.id === id);
    picks[objIndex].hometeamscore = homescore;
    picks[objIndex].awayteamscore = awayscore;
    console.log(picks)
  };

  return (
    <div>
      <h2>Enter your picks</h2>

      {status === "loading" && <p>Loading your picks...</p>}

      {status === "error" && <p>Error fetching your picks...</p>}

      {status === "success" && (
        <>
          <div>
            {groupedFixtures.map((fixture) => (
              <div className="card" key={fixture.date}>
                <h4>{new Date(fixture.date).toDateString()}</h4>
                {fixture.matches.map((match) => (
                  <div key={match.id}>
                    {match.hometeamname.name}
                    <input
                      type="text"
                      onChange={(e) => {
                        setHometeamscore(e.target.value);
                        handleUpdatePick(
                          match.id,
                          e.target.value,
                          awayteamscore
                        );
                      }}
                    ></input>
                    vs {match.awayteamname.name}
                    <input
                      type="text"
                      onChange={(e) => {
                        setAwayteamscore(e.target.value);
                        handleUpdatePick(
                          match.id,
                          hometeamscore,
                          e.target.value
                        );
                      }}
                    ></input>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MakePicks;
