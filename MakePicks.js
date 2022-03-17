import React, { useState } from "react";
import { useQuery } from "react-query";
import supabase from "../utils/supabase";
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
  const { user } = useAuth();
  const { data, status } = useQuery(["matches"], fetchFixtures);
  const holdingArray = [];
  const [picks, setPicks] = useState(() => {
    if (status === "success" && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        holdingArray[i] = {
          matchid: null,
          userid: null,
          hometeamscore: null,
          awayteamscore: null,
        };
      }
    }
    return holdingArray;
  });

  const handleChange = (index, event, id) => {
    const predictions = [...picks];
    predictions[index]["matchid"] = id;
    predictions[index]["userid"] = user.id;
    predictions[index][event.target.name] = event.target.value;
    setPicks(predictions);
    console.log(picks);
  };

  return (
    <div>
      <h2>Enter your picks</h2>
      {status === "loading" && <p>Loading your picks...</p>}

      {status === "error" && <p>Error fetching your picks...</p>}

      {status === "success" && (
        <>
          <div>
            {data.map((fixture, index) => (
              <div className="card" key={fixture.id}>
                <h4>{new Date(fixture.matchdate).toDateString()}</h4>
                <div className="form-group" key={fixture.id}>
                  <p>
                    Match ID {fixture.id} {fixture.hometeamname.name} vs{" "}
                    {fixture.awayteamname.name}
                  </p>
                  <input
                    name="hometeamscore"
                    className="form-control"
                    type="text"
                    onChange={(e) => {
                      handleChange(index, e, fixture.id);
                    }}
                  ></input>
                  <input
                    name="awayteamscore"
                    className="form-control"
                    type="text"
                    onChange={(e) => {
                      handleChange(index, e, fixture.id);
                    }}
                  ></input>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MakePicks;
