module.exports = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'api.sayodatravel.com',
                pathname: '/uploads/**',
            },
        ],
    },
    // images: {
    //     remotePatterns: [
    //         {
    //             protocol: 'http',
    //             hostname: 'localhost',
    //             port: '3001',
    //             pathname: '/uploads/**',
    //         },
    //     ],
    // },
};
