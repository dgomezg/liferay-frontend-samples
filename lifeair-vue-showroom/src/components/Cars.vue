<template>
    <div>
        <div class="header">
            <img alt="header image" src="../assets/riuvo-logo.png">
            <span class="text-logo">Riuvo Pasadena</span>
        </div>

        <div class="content-container">

            <ApolloQuery :query="gql => gql`
                query {
                  cars: contentSetContentSetElements(contentSetId: ${CONTENT_SET_ID}) {
                    items {
                        id
                        title
                        content {
                          ... on StructuredContent {
                            details: contentFields {
                              type: dataType
                              name
                              label
                              value {
                                data
                                geo {
                                  latitude
                                  longitude
                                }
                                image {
                                  ... on ContentDocument {
                                    contentUrl
                                    encodingFormat
                                  }
                                }

                              }
                            }
                            relatedContents {
                                id
                                title
                                graphQLNode {
                                  ... on StructuredContent {
                                    details: contentFields {
                                      type: dataType
                                      name
                                      label
                                      value {
                                        data
                                      }
                                    }
                                  }
                                }
                            }
                          }
                        }
                    }
                    page
                    pageSize
                    totalCount
                  }
                }`">

                <template slot-scope="{ result: { data, loading }}">
                    <div v-if="loading">Loading...</div>
                    <div v-else>
                        <div v-if="isMoreInfoShown">

                            <h1>{{car.title}}</h1>

                            <div style="display: flex">
                                <div style="flex: 1">
                                    <img :src="getImageUrl(car.content)" alt="Car image" style="width:100%"></div>
                                <div style="flex: 1">
                                    <h2>{{getContentAttr(car, 'ModelSubtitle')}}</h2>
                                    <p>{{getContentAttr(car, 'ModelSummary')}}</p>
                                    <ul v-bind:key="related.id"
                                        v-for="related in car.content.relatedContents">
                                        <li v-bind:key="detail.name" v-for="detail in related.graphQLNode.details">
                                            {{detail.name}} - {{detail.value.data}}
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <button @click="showCarousel()" class="action-button">Close</button>
                        </div>
                        <div v-else>
                            <vue-glide :autoplay=3000 :key="data.cars.items.count" :per-view=1 type="carousel"
                                       v-if="data">
                                <vue-glide-slide autoplay="true" v-bind:key="car.id" v-for="car in data.cars.items">
                                    <img :src="getImageUrl(car.content)" @click="showPanelInfo(car)"
                                         alt="car carousel image"/>
                                </vue-glide-slide>
                            </vue-glide>
                        </div>
                    </div>
                </template>
            </ApolloQuery>
        </div>
        <v-dialog id="dialog"/>
        <modal height=400 name="video-modal" width=600>
            <video autoplay height="400" id="video" muted width="600"></video>
        </modal>
        <div class="cta-container">
            <button @click="detectAge()" class="action-button">Find better cars!</button>
        </div>
        <div class="footer">
            <img alt="footer" src="../assets/footer.png">
        </div>
    </div>

</template>

<script>

    import * as faceapi from "face-api.js";
    import {onLogin} from "../vue-apollo";

    let stream;

    export default {
        props: {},
        components: {},
        data() {
            return {
                car: {},
                CONTENT_SET_ID: 42345,
                SERVER_URL: 'http://localhost:8080/',
                WEIGHTS_URL: 'http://127.0.0.1:8082',
                TEST_AUTH: 'dGVzdEBsaWZlcmF5LmNvbTp0ZXN0',
                YOUNG_AUTH: 'eW91bmdAeW91bmcueW91bmc6eW91bmd5b3VuZw==',
                isMoreInfoShown: false,
            }
        },
        methods: {
            getContentAttr(car, key) {
                return car.content.details.filter(detail => detail.name === key).map(detail => detail.value.data).join(',')
            },
            getImageUrl(data) {
                return data.details.filter(detail => detail.type === 'image').map(detail => this.SERVER_URL + detail.value.image.contentUrl)[0];
            },
            showCarousel() {
                this.isMoreInfoShown = false;
            },
            showMoreInfo(car) {
                this.isMoreInfoShown = true;
                this.$modal.hide('dialog');
                this.car = car;
            },
            showPanelInfo(car) {
                this.$modal.show('dialog', {
                    title: car.title,
                    text: `
                        <p>${this.getContentAttr(car, 'ModelSubtitle')}</p>
                        <p>${this.getContentAttr(car, 'ModelSummary')}</p>
                        <p>${this.getContentAttr(car, 'ModelDetails')}</p>
                    `,
                    buttons: [
                        {
                            title: 'More Information',
                            handler: () => {
                                this.showMoreInfo(car);
                            }
                        },
                        {
                            title: 'Close'
                        }
                    ]
                })
            },
            async detectAge() {
                this.$modal.show('video-modal');

                await faceapi.loadTinyFaceDetectorModel(this.WEIGHTS_URL);
                await faceapi.loadAgeGenderModel(this.WEIGHTS_URL);

                stream = await navigator.mediaDevices.getUserMedia({video: {}});
                const video = document.getElementById('video');
                video.srcObject = stream;

                setTimeout(() => this.onPlay(this.$modal, this), 1000);
            },
            async onPlay(modal, that) {
                const video = document.getElementById('video');
                const options = new faceapi.TinyFaceDetectorOptions({inputSize: 128, scoreThreshold: 0.3});
                const result = await faceapi.detectSingleFace(video, options).withAgeAndGender();

                // eslint-disable-next-line
                console.log('Age is ', result);

                if (!result) {
                    setTimeout(() => this.onPlay(modal, that))
                } else {
                    stream.getTracks().forEach(function (track) {
                        track.stop();
                    });
                    modal.hide('video-modal');

                    await onLogin(that.$apollo.getClient(), 'Basic ' + (result.age < 50 ? this.YOUNG_AUTH : this.TEST_AUTH));
                    window.location.reload();
                }
            }
        }
    }
</script>

<style scoped>
    ul {
        display: block;
        list-style-type: none;
        margin-block-start: 0;
        margin-block-end: 0;
        margin-inline-start: 0;
        margin-inline-end: 0;
        padding-inline-start: 0;
        padding-inline-end: 0;
    }

    .text-logo {
        padding-left: 20px;
        font-size: 20px;
        font-weight: 700;
    }

    .header {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    }

    .header img {
        width: 50px;
    }

    .content-container {
        padding-top: 100px;
        height: 500px;
    }

    .content-container ul {
        height: 100%;
    }

    .action-button {
        font-size: 12px;
        text-transform: uppercase;
        border-radius: 0;
        color: #FFFFFF;
        background-color: #30313F;
        line-height: 2.5;
        border-color: #30313F;
    }

    .cta-container {
        padding: 50px;
        background-color: #D92142;
    }

    .footer {
        background-color: #272833;
        padding: 10px;
        text-align: right;
    }

    .footer img {
        height: 80px;
    }
</style>
