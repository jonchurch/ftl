# @spacejunk/ftl 🚀

> 🚧 This project is currently still a work in progress
Welcome to @spacejunk/ftl! Having trouble navigating the galaxy of rate limits and bursts while making API requests? FTL (Faster-Than-Light) is here to help. This package is designed to manage and streamline your Axios requests, ensuring they adhere to the rate limits and burst restrictions set by your API provider.

### Features:

- 🌌 Manage rate-limited and burst-limited requests effortlessly
- 🪐 Automatic request queuing and execution
- 🛸 Built-in rate limit and burst tracking
- 📡 Exportable request logs for debugging and analysis (🚧 under development)

## Installation

Install @spacejunk/ftl and axios using npm or yarn:

```bash
npm install @spacejunk/ftl axios
```

or

```bash
yarn add @spacejunk/ftl axios
```

## Usage

To start using `@spacejunk/ftl`, follow the example below and customize the configuration to suit your needs. With the provided instance, you can make API requests as you normally would.

```javascript
import FTL from '@spacejunk/ftl';
import axios from 'axios';

const axiosInstance = axios.create({ baseURL: 'https://api.example.com' });

const ftl = new FTL({
  maxRequestsPerSecond: 10, // the maximum number of requests per second
  burstRequests: 5, // the number of burst requests allowed
  burstTime: 1, // the time window for burst requests (in seconds)
  instance: axiosInstance, // your axios instance
});

const api = ftl.getInstance();

// Now you can make your API requests as usual with your axios instance
api.get('/endpoint').then((response) => {
  console.log(response.data);
});
```

## Contributing

We appreciate all fellow space travelers who want to contribute! If you have any suggestions, bug reports, or feature requests, feel free to open an issue or submit a pull request. Let's make @spacejunk/ftl even better together! 🤝

