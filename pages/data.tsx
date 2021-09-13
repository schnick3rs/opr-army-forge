import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../data/store'
import { load } from '../data/armySlice'
import { ArmyList } from "../views/ArmyList";
import { MainList } from "../views/MainList";

export default function Data() {

    const [input, setInput] = useState("");
    const [json, setJson] = useState("");
    const handleChange = (e) => setInput(e.target.value);

    function process(units) {
        var results = [];

        function parseEquipment(str) {
            var parts = str
                .split(/(?<!\(\d)\),/)
                .map((part) => part.trim())
                .map((part) => (/(?<!\(\d)\)/.test(part) ? part : part + ")"))
                .map((part) => {
                    if (part === "-)") return null;

                    const match = /((\d+)x\s)?(.+?)\((.+)\)/.exec(part);
                    const attacksMatch = /A(\d+)[,\)]/.exec(part);
                    const rangeMatch = /(\d+)["”][,\)]/.exec(part);
                    const rules = match[4].split(",").map((r) => r.trim());
                    const specialRules = rules.filter(
                        (r) => !/A\d+/.test(r) && !/\d+["”]/.test(r)
                    );

                    return {
                        name: match[3].trim(),
                        count: match[2] ? parseInt(match[2]) : undefined,
                        attacks: attacksMatch ? parseInt(attacksMatch[1]) : undefined,
                        range: rangeMatch ? parseInt(rangeMatch[1]) : undefined,
                        specialRules: specialRules.length ? specialRules : undefined,
                    };
                })
                .filter((p) => !!p);
            return parts;
        }

        for (var line of units.split("\n").filter((l) => !!l)) {
            var match =
                /^(.+)\[(\d+)\]\s(\d+\+)\s(\d+\+)\s(.*?\)\s|-)(.+?)((?:[A-Z],?\s?|-\s?)+)(\d+)pt/gm.exec(
                    line
                );

            var parsed = {
                name: match[1].trim(),
                size: parseInt(match[2]),
                quality: match[3],
                defense: match[4],
                equipment: parseEquipment(match[5]),
                specialRules: match[6].split(",").map((s) => s.trim()),
                upgradeSets:
                    match[7] && match[7].trim() === "-"
                        ? []
                        : match[7].split(",").map((s) => s.trim()),
                cost: parseInt(match[8]),
            };

            results.push(parsed);
        }

        setJson(JSON.stringify(results, null, 2));
    }

    return (
        <>
            <Head>
                <title>OPR Army Forge</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div>
                <textarea className="textarea">{json}</textarea>
                <textarea className="textarea" onChange={handleChange}>
                    {input}
                </textarea>
                <button className="button is-primary" onClick={() => process(input)}>Generate JSON</button>
            </div>
        </>
    );
}