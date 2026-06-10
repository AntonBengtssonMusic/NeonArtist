exports.handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: cors, body: "ok" };
  }

  let email;
  try {
    ({ email } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  if (!email) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Email required" }) };
  }

  const res = await fetch("https://us16.api.mailchimp.com/3.0/lists/2f3acf1f5d/members", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Basic " + Buffer.from("anystring:eb19dc4676b14ec549cda62363e66b33-us16").toString("base64"),
    },
    body: JSON.stringify({ email_address: email, status: "subscribed" }),
  });

  const data = await res.json();

  // Already subscribed is fine
  if (res.ok || data.title === "Member Exists") {
    return { statusCode: 200, headers: cors, body: JSON.stringify({ success: true }) };
  }

  return {
    statusCode: res.status,
    headers: cors,
    body: JSON.stringify({ error: data.detail || "Mailchimp error" }),
  };
};
