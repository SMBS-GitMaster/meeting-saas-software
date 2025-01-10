import React from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import {
  Card,
  Clickable,
  Expandable,
  Icon,
  QuickAddTextInput,
  SelectQuickAddUserSelection,
} from '@mm/core-web/ui'

export function CardDemo() {
  const [activeTab, setActiveTab] = React.useState('meeting')
  const [value, setValue] = React.useState('')
  const [selectedUser, setSelectedUser] = React.useState<Id>('')
  return (
    <Expandable title='Cards'>
      <>
        <Card
          css={css`
            height: 400px;
            width: 640px;
            margin-bottom: 24px;
          `}
        >
          <Card.Header
            renderLeft={<Card.Title>Simple Card</Card.Title>}
            renderRight={
              <>
                <Clickable clicked={() => null}>
                  <Icon iconName='moreVerticalIcon' iconSize='lg' />
                </Clickable>
              </>
            }
          ></Card.Header>

          <Card.Body>
            <Card.BodySafeArea>
              <p>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Soluta
                nostrum laborum aut odit eveniet. Officiis corporis porro
                deserunt earum omnis sapiente beatae! Fugit consequuntur, cum
                officiis magnam natus labore amet modi itaque, hic eius eveniet
                dolor. Dignissimos, quisquam! Rem, corrupti?
              </p>
              <p>
                Nihil maiores et illo minima in unde laborum, voluptatem eos
                provident, fugit id vitae perferendis nemo. Blanditiis
                perspiciatis quia corporis, eaque consectetur ratione unde nisi
                exercitationem neque pariatur asperiores expedita sit quas
                perferendis nihil, molestiae nemo officiis ut optio autem.
              </p>
              <p>
                Ab, repellat. Consectetur quasi modi vero aperiam quibusdam
                earum nobis neque culpa, repellat temporibus eaque cupiditate
                rerum! Ex, harum. Quasi, tenetur omnis ea hic aperiam, qui nemo
                inventore eius accusantium impedit odit necessitatibus nisi
                commodi sunt labore asperiores expedita reprehenderit?
              </p>
              <p>
                Architecto odit rerum nemo, inventore necessitatibus animi odio,
                deserunt asperiores unde fugiat vero similique doloremque earum
                quia voluptates pariatur quod placeat tempore magni rem quam.
                Dolorem, nihil mollitia. Dolores, alias dignissimos quam omnis
                praesentium minus dicta dolorem deserunt deleniti nesciunt!
              </p>
              <p>
                Facilis laborum ratione veniam voluptatem ad nobis quaerat porro
                sint, libero molestiae maiores, harum omnis id facere magnam,
                repellendus sed fugiat delectus praesentium optio atque officia
                fugit! Tempore officiis impedit, fugiat, iusto nemo quidem
                eveniet iste, laboriosam ut ipsum itaque.
              </p>
              <p>
                Maxime, labore sit? Optio, sed labore? Doloremque cum deleniti
                aspernatur voluptatibus nobis ducimus dolore commodi. Mollitia
                magni cumque reprehenderit dolorem quas ducimus enim debitis
                assumenda magnam similique illo ad iste soluta, libero
                reiciendis nemo facilis saepe repudiandae. Saepe, reiciendis
                voluptate?
              </p>
              <p>
                Accusamus fuga nihil quos ab itaque perferendis enim, quia
                libero in labore odio nam animi ut, natus doloribus neque? Nemo
                facere officia dicta ducimus cupiditate repellat quas ex non
                beatae, pariatur consectetur ut corrupti unde perferendis
                voluptatibus ullam, quasi adipisci.
              </p>
              <p>
                Libero velit pariatur aperiam, cupiditate in recusandae iure
                facilis iusto nesciunt consectetur, tempora vel placeat corrupti
                reiciendis quis minus, nisi debitis modi! Eligendi molestias
                dicta atque facere cumque iste porro aliquam molestiae
                doloremque reprehenderit, exercitationem, ut repudiandae, odit
                non quis.
              </p>
              <p>
                Minus omnis voluptate, et nesciunt vitae esse voluptatum officia
                dicta magnam consequatur maxime expedita similique reiciendis
                fuga suscipit voluptates minima, accusantium, tenetur laudantium
                autem consequuntur quo? Eveniet amet doloribus suscipit,
                laudantium incidunt laboriosam quisquam repudiandae dolores,
                ipsa maxime molestiae sint?
              </p>
              <p>
                Expedita enim tenetur ex, voluptatum iste, consectetur dolor
                possimus ratione unde magnam veniam aspernatur quia omnis
                recusandae eligendi neque adipisci! Quia totam omnis consequatur
                earum tempora reprehenderit fugiat atque dignissimos libero
                exercitationem facere esse minus, at soluta. Magnam, dolorem
                sequi.
              </p>
            </Card.BodySafeArea>
          </Card.Body>
        </Card>
        <Card
          css={css`
            height: 400px;
            width: 640px;
            margin-bottom: 24px;
          `}
        >
          <Card.Header
            renderLeft={<Card.Title>Card without body padding</Card.Title>}
            renderRight={
              <>
                <Clickable clicked={() => null}>
                  <Icon iconName='moreVerticalIcon' iconSize='lg' />
                </Clickable>
              </>
            }
          ></Card.Header>

          <Card.Body>
            <p>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Soluta
              nostrum laborum aut odit eveniet. Officiis corporis porro deserunt
              earum omnis sapiente beatae! Fugit consequuntur, cum officiis
              magnam natus labore amet modi itaque, hic eius eveniet dolor.
              Dignissimos, quisquam! Rem, corrupti?
            </p>
            <p>
              Nihil maiores et illo minima in unde laborum, voluptatem eos
              provident, fugit id vitae perferendis nemo. Blanditiis
              perspiciatis quia corporis, eaque consectetur ratione unde nisi
              exercitationem neque pariatur asperiores expedita sit quas
              perferendis nihil, molestiae nemo officiis ut optio autem.
            </p>
            <p>
              Ab, repellat. Consectetur quasi modi vero aperiam quibusdam earum
              nobis neque culpa, repellat temporibus eaque cupiditate rerum! Ex,
              harum. Quasi, tenetur omnis ea hic aperiam, qui nemo inventore
              eius accusantium impedit odit necessitatibus nisi commodi sunt
              labore asperiores expedita reprehenderit?
            </p>
            <p>
              Architecto odit rerum nemo, inventore necessitatibus animi odio,
              deserunt asperiores unde fugiat vero similique doloremque earum
              quia voluptates pariatur quod placeat tempore magni rem quam.
              Dolorem, nihil mollitia. Dolores, alias dignissimos quam omnis
              praesentium minus dicta dolorem deserunt deleniti nesciunt!
            </p>
            <p>
              Facilis laborum ratione veniam voluptatem ad nobis quaerat porro
              sint, libero molestiae maiores, harum omnis id facere magnam,
              repellendus sed fugiat delectus praesentium optio atque officia
              fugit! Tempore officiis impedit, fugiat, iusto nemo quidem eveniet
              iste, laboriosam ut ipsum itaque.
            </p>
            <p>
              Maxime, labore sit? Optio, sed labore? Doloremque cum deleniti
              aspernatur voluptatibus nobis ducimus dolore commodi. Mollitia
              magni cumque reprehenderit dolorem quas ducimus enim debitis
              assumenda magnam similique illo ad iste soluta, libero reiciendis
              nemo facilis saepe repudiandae. Saepe, reiciendis voluptate?
            </p>
            <p>
              Accusamus fuga nihil quos ab itaque perferendis enim, quia libero
              in labore odio nam animi ut, natus doloribus neque? Nemo facere
              officia dicta ducimus cupiditate repellat quas ex non beatae,
              pariatur consectetur ut corrupti unde perferendis voluptatibus
              ullam, quasi adipisci.
            </p>
            <p>
              Libero velit pariatur aperiam, cupiditate in recusandae iure
              facilis iusto nesciunt consectetur, tempora vel placeat corrupti
              reiciendis quis minus, nisi debitis modi! Eligendi molestias dicta
              atque facere cumque iste porro aliquam molestiae doloremque
              reprehenderit, exercitationem, ut repudiandae, odit non quis.
            </p>
            <p>
              Minus omnis voluptate, et nesciunt vitae esse voluptatum officia
              dicta magnam consequatur maxime expedita similique reiciendis fuga
              suscipit voluptates minima, accusantium, tenetur laudantium autem
              consequuntur quo? Eveniet amet doloribus suscipit, laudantium
              incidunt laboriosam quisquam repudiandae dolores, ipsa maxime
              molestiae sint?
            </p>
            <p>
              Expedita enim tenetur ex, voluptatum iste, consectetur dolor
              possimus ratione unde magnam veniam aspernatur quia omnis
              recusandae eligendi neque adipisci! Quia totam omnis consequatur
              earum tempora reprehenderit fugiat atque dignissimos libero
              exercitationem facere esse minus, at soluta. Magnam, dolorem
              sequi.
            </p>
          </Card.Body>
        </Card>
        <Card
          css={css`
            height: 400px;
            width: 640px;
            margin-bottom: 24px;
          `}
        >
          <Card.Header
            renderLeft={<Card.Title>Card with tabs</Card.Title>}
            renderRight={
              <>
                <Clickable clicked={() => null}>
                  <Icon iconName='moreVerticalIcon' iconSize='lg' />
                </Clickable>
              </>
            }
          >
            <Card.Tabs
              active={activeTab}
              onChange={setActiveTab}
              tabs={[
                { text: 'This Meeting', value: 'meeting' },
                {
                  text: '(Meeting name) business plan',
                  value: 'meeting_business',
                },
                {
                  text: '(Company name) business plan',
                  value: 'commpany_business',
                },
              ]}
            />
          </Card.Header>

          <Card.Body>
            <Card.BodySafeArea>
              {activeTab === 'meeting' && (
                <>
                  <p>
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                    Soluta nostrum laborum aut odit eveniet. Officiis corporis
                    porro deserunt earum omnis sapiente beatae! Fugit
                    consequuntur, cum officiis magnam natus labore amet modi
                    itaque, hic eius eveniet dolor. Dignissimos, quisquam! Rem,
                    corrupti?
                  </p>
                  <p>
                    Nihil maiores et illo minima in unde laborum, voluptatem eos
                    provident, fugit id vitae perferendis nemo. Blanditiis
                    perspiciatis quia corporis, eaque consectetur ratione unde
                    nisi exercitationem neque pariatur asperiores expedita sit
                    quas perferendis nihil, molestiae nemo officiis ut optio
                    autem.
                  </p>
                  <p>
                    Ab, repellat. Consectetur quasi modi vero aperiam quibusdam
                    earum nobis neque culpa, repellat temporibus eaque
                    cupiditate rerum! Ex, harum. Quasi, tenetur omnis ea hic
                    aperiam, qui nemo inventore eius accusantium impedit odit
                    necessitatibus nisi commodi sunt labore asperiores expedita
                    reprehenderit?
                  </p>
                  <p>
                    Architecto odit rerum nemo, inventore necessitatibus animi
                    odio, deserunt asperiores unde fugiat vero similique
                    doloremque earum quia voluptates pariatur quod placeat
                    tempore magni rem quam. Dolorem, nihil mollitia. Dolores,
                    alias dignissimos quam omnis praesentium minus dicta dolorem
                    deserunt deleniti nesciunt!
                  </p>
                  <p>
                    Facilis laborum ratione veniam voluptatem ad nobis quaerat
                    porro sint, libero molestiae maiores, harum omnis id facere
                    magnam, repellendus sed fugiat delectus praesentium optio
                    atque officia fugit! Tempore officiis impedit, fugiat, iusto
                    nemo quidem eveniet iste, laboriosam ut ipsum itaque.
                  </p>
                  <p>
                    Maxime, labore sit? Optio, sed labore? Doloremque cum
                    deleniti aspernatur voluptatibus nobis ducimus dolore
                    commodi. Mollitia magni cumque reprehenderit dolorem quas
                    ducimus enim debitis assumenda magnam similique illo ad iste
                    soluta, libero reiciendis nemo facilis saepe repudiandae.
                    Saepe, reiciendis voluptate?
                  </p>
                  <p>
                    Accusamus fuga nihil quos ab itaque perferendis enim, quia
                    libero in labore odio nam animi ut, natus doloribus neque?
                    Nemo facere officia dicta ducimus cupiditate repellat quas
                    ex non beatae, pariatur consectetur ut corrupti unde
                    perferendis voluptatibus ullam, quasi adipisci.
                  </p>
                  <p>
                    Libero velit pariatur aperiam, cupiditate in recusandae iure
                    facilis iusto nesciunt consectetur, tempora vel placeat
                    corrupti reiciendis quis minus, nisi debitis modi! Eligendi
                    molestias dicta atque facere cumque iste porro aliquam
                    molestiae doloremque reprehenderit, exercitationem, ut
                    repudiandae, odit non quis.
                  </p>
                  <p>
                    Minus omnis voluptate, et nesciunt vitae esse voluptatum
                    officia dicta magnam consequatur maxime expedita similique
                    reiciendis fuga suscipit voluptates minima, accusantium,
                    tenetur laudantium autem consequuntur quo? Eveniet amet
                    doloribus suscipit, laudantium incidunt laboriosam quisquam
                    repudiandae dolores, ipsa maxime molestiae sint?
                  </p>
                  <p>
                    Expedita enim tenetur ex, voluptatum iste, consectetur dolor
                    possimus ratione unde magnam veniam aspernatur quia omnis
                    recusandae eligendi neque adipisci! Quia totam omnis
                    consequatur earum tempora reprehenderit fugiat atque
                    dignissimos libero exercitationem facere esse minus, at
                    soluta. Magnam, dolorem sequi.
                  </p>
                </>
              )}

              {activeTab === 'meeting_business' && (
                <>
                  <p>
                    Porro fugiat harum perspiciatis accusamus eveniet et, eum
                    iusto fuga molestiae vel reprehenderit animi libero totam
                    aliquam corrupti dolores iure.
                  </p>
                  <p>
                    Ducimus, voluptatum laudantium nemo nisi deleniti excepturi
                    earum optio. Perspiciatis vero sint velit fuga eos ea nihil
                    delectus nam harum?
                  </p>
                  <p>
                    Nostrum rem autem sint, dolorem dolor asperiores magni ullam
                    voluptas impedit dolores minima cumque soluta nihil facilis,
                    numquam excepturi harum.
                  </p>
                </>
              )}
              {activeTab === 'commpany_business' && (
                <>
                  <p>
                    Incidunt delectus vitae perspiciatis consequatur qui
                    obcaecati quia? Et cum repellat aliquam nobis deleniti?
                    Ducimus recusandae quae assumenda laborum nesciunt?
                  </p>
                  <p>
                    Qui dicta error minima maiores et ducimus rem. Alias
                    deleniti consequuntur assumenda eveniet molestias laborum
                    delectus aperiam temporibus eius voluptas.
                  </p>
                  <p>
                    Debitis omnis in voluptates ratione pariatur voluptate minus
                    ipsam exercitationem, nam quisquam necessitatibus nobis
                    beatae reiciendis, esse illo voluptatum aperiam!
                  </p>
                  <p>
                    Recusandae natus nostrum exercitationem reiciendis?
                    Perferendis animi expedita dignissimos nam tenetur! Velit
                    iure voluptatum obcaecati temporibus pariatur, ad cupiditate
                    commodi?
                  </p>
                </>
              )}
            </Card.BodySafeArea>
          </Card.Body>
        </Card>
        <Card
          css={css`
            height: 400px;
            width: 640px;
            margin-bottom: 24px;
          `}
        >
          <Card.Header
            renderLeft={<Card.Title>Card with Quick Add text input</Card.Title>}
            renderRight={
              <>
                <Clickable clicked={() => null}>
                  <Icon iconName='moreVerticalIcon' iconSize='lg' />
                </Clickable>
              </>
            }
          >
            <Card.SubHeader>
              <div
                css={css`
                  display: flex;
                  align-items: flex-start;
                `}
              >
                <SelectQuickAddUserSelection
                  id={'selectInputSingleCustomRenderOptions'}
                  value={selectedUser}
                  unknownItemText={'Unknown user'}
                  placeholder={'Select a user'}
                  options={[
                    {
                      value: 'user-id-1',
                      metadata: {
                        firstName: 'John asdnhjk asd asd',
                        lastName: 'Doe',
                        fullName: 'John Doe asd asd',
                        avatar: null,
                        userAvatarColor: 'COLOR1',
                      },
                    },
                    {
                      value: 'user-id-2',
                      metadata: {
                        firstName: 'Xohn asdnhsad  asd jk asd asd',
                        lastName: 'Doe asd asd asds asd',
                        fullName: 'John Doe',
                        avatar: null,
                        userAvatarColor: 'COLOR1',
                      },
                    },
                  ]}
                  name={'selectInput'}
                  onChange={setSelectedUser}
                  error={undefined}
                  width='56px'
                />
                <QuickAddTextInput
                  value={value}
                  onChange={setValue}
                  id='quickAddTextInput'
                  placeholder='Create a quick Headline'
                  name='quickAddTextInput'
                  onEnter={(value) => {
                    alert(`Text entered: ${value}`)
                    setValue('')
                  }}
                  css={css`
                    margin-left: 8px;
                    flex: 1;
                  `}
                  instructions={
                    <>
                      Press <strong>enter</strong> to add new Headline
                    </>
                  }
                />
              </div>
            </Card.SubHeader>
          </Card.Header>

          <Card.Body>
            <Card.BodySafeArea>
              <p>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Soluta
                nostrum laborum aut odit eveniet. Officiis corporis porro
                deserunt earum omnis sapiente beatae! Fugit consequuntur, cum
                officiis magnam natus labore amet modi itaque, hic eius eveniet
                dolor. Dignissimos, quisquam! Rem, corrupti?
              </p>
              <p>
                Nihil maiores et illo minima in unde laborum, voluptatem eos
                provident, fugit id vitae perferendis nemo. Blanditiis
                perspiciatis quia corporis, eaque consectetur ratione unde nisi
                exercitationem neque pariatur asperiores expedita sit quas
                perferendis nihil, molestiae nemo officiis ut optio autem.
              </p>
            </Card.BodySafeArea>
          </Card.Body>
        </Card>
      </>
    </Expandable>
  )
}
