code for the lambda function that makes an alexa skill to invoke a Liferay Portal backend.

You should create a `.env` file with the following contents:

```
AUTHORIZATION_TOKEN='<<Basic Authorization token that should be sent as header in the REST request>>'
DESTINATION_CONTENTSET_ID=Id of the content set to be retrieved
BACKEND_SERVER=URL of the backend that will be invoked i.e: https://predico.serveo.net
```

