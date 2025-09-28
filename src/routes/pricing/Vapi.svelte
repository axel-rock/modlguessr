<svelte:head>
	<script
		src="https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js"
		async
		type="text/javascript"
	></script>
</svelte:head>

<vapi-widget
	public-key="90b42b4f-0e6c-4d9d-bf49-06e0da833a70"
	assistant-id="4da2e52e-99c0-4b07-9a57-f5111912f2ab"
	mode="voice"
	theme="dark"
	base-bg-color="#000000"
	accent-color="#14B8A6"
	cta-button-color="#000000"
	cta-button-text-color="#ffffff"
	border-radius="large"
	size="full"
	position="bottom-right"
	title="Talk with Chad, our sales assistant"
	start-button-text="Start"
	end-button-text="End Call"
	chat-first-message="Hey, How can I help you today?"
	chat-placeholder="Type your message..."
	voice-show-transcript="true"
	consent-required="true"
	consent-title="Terms and conditions"
	consent-content="By clicking 'Agree', and each time I interact with this AI agent, I consent to the recording, storage, and sharing of my communications with third-party service providers, and as otherwise described in our Terms of Service."
	consent-storage-key="vapi_widget_consent"
></vapi-widget>
