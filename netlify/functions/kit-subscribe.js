exports.handler = async (event) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "ok" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };
  }

  const apiKey = process.env.KIT_API_KEY || "aAM3p3Lfduz0KKwBCoKdKg";

  let email;
  try {
    ({ email } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  if (!email) {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Email required" }) };
  }

  const FORM_ID = "9543219";

  const kitRes = await fetch(`https://api.convertkit.com/v3/forms/${FORM_ID}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey, email }),
  });

  const data = await kitRes.json();

  const subscription = data?.subscription ?? null;
  const subscriber = subscription?.subscriber ?? data?.subscriber ?? null;
  const hasSubscriptionConfirmation = Boolean(
    subscription?.id || subscription?.state || subscription?.subscriber
  );

  if (!kitRes.ok || (!subscriber && !hasSubscriptionConfirmation)) {
    return {
      statusCode: kitRes.status >= 400 ? kitRes.status : 502,
      headers: corsHeaders,
      body: JSON.stringify({
        error: data?.error || data?.message || "Kit did not create or return the subscriber",
        kitStatus: kitRes.status,
        kitResponse: data,
      }),
    };
  }

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ success: true }),
  };
};
