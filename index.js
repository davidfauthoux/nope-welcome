import * as nope from "../book/nope.js";
import * as async from "../modules/async.js";
// jquery

import { willPostEvent, handleEvent } from "./api-all.js";

$(function() {
	async.run(
		nope.launch(),
		(history) => {
			if (history !== null) {
				willPostEvent(history.userId, (event) => {
					console.log("POSTING", event);
					async.run(
						history.stack(event),
					);
				});
				return [
					{
						thread: {
							while: true,
							do: [
								history.history(),
								_ => console.log("EVENT", _),
								handleEvent,
							],
						},
					},
				];
			}
		},
	);
});
